import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codeconnections from "aws-cdk-lib/aws-codeconnections";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipelineActions from "aws-cdk-lib/aws-codepipeline-actions";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface CodePipelineDeployBuildEnvironmentProps {
  readonly computeMode?: "ec2" | "lambda";
  readonly lambdaComputeType?: codebuild.ComputeType;
  readonly lambdaBuildImage?: codebuild.IBuildImage;
}

export interface GitHubActionsCodePipelineDeployProps {
  readonly buildSpecPath: string;
  readonly connectionName: string;
  readonly deployBuildEnvironment?: CodePipelineDeployBuildEnvironmentProps;
  readonly deployStackName: string;
  readonly githubActionsBranch: string;
  readonly githubActionsRepo: string;
  readonly githubOidcProviderArn?: string;
  readonly githubBranch: string;
  readonly githubOwner: string;
  readonly githubRepo: string;
  readonly pipelineName: string;
  readonly projectName: string;
  readonly region: string;
  readonly sourceActionName: string;
}

const NODE_24_LAMBDA_BUILD_IMAGE: codebuild.IBuildImage = {
  defaultComputeType: codebuild.ComputeType.LAMBDA_4GB,
  imageId: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs24",
  imagePullPrincipalType: codebuild.ImagePullPrincipalType.CODEBUILD,
  runScriptBuildspec: (entrypoint: string) =>
    codebuild.LinuxLambdaBuildImage.AMAZON_LINUX_2023_NODE_22.runScriptBuildspec(
      entrypoint
    ),
  type: "LINUX_LAMBDA_CONTAINER",
  validate: (buildEnvironment: codebuild.BuildEnvironment) => {
    const errors: string[] = [];

    if (buildEnvironment.privileged) {
      errors.push("Lambda compute type does not support privileged mode");
    }

    if (
      buildEnvironment.computeType &&
      !buildEnvironment.computeType.startsWith("BUILD_LAMBDA")
    ) {
      errors.push(
        `Lambda build images only support Lambda compute types, got '${buildEnvironment.computeType}'`
      );
    }

    return errors;
  }
};

export class GitHubActionsCodePipelineDeploy extends Construct {
  public readonly connection: codeconnections.CfnConnection;
  public readonly oidcProvider: iam.IOpenIdConnectProvider;
  public readonly pipeline: codepipeline.Pipeline;
  public readonly project: codebuild.Project;
  public readonly starterRole: iam.Role;

  constructor(
    scope: Construct,
    id: string,
    props: GitHubActionsCodePipelineDeployProps
  ) {
    super(scope, id);

    this.connection = new codeconnections.CfnConnection(this, "Connection", {
      connectionName: props.connectionName,
      providerType: "GitHub"
    });

    this.oidcProvider = props.githubOidcProviderArn
      ? iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
          this,
          "GitHubOidc",
          props.githubOidcProviderArn
        )
      : new iam.OpenIdConnectProvider(this, "GitHubOidc", {
          clientIds: ["sts.amazonaws.com"],
          url: "https://token.actions.githubusercontent.com"
        });

    const serviceRole = new iam.Role(this, "CodeBuildServiceRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com")
    });

    // Keep the initial deploy runner broad so CDK deploys do not fail on missing
    // service permissions while the monorepo CI/CD model is still being bootstrapped.
    serviceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
    );

    const deployBuildEnvironment =
      props.deployBuildEnvironment ?? ({} satisfies CodePipelineDeployBuildEnvironmentProps);
    const deployComputeMode = deployBuildEnvironment.computeMode ?? "ec2";
    const deployBuildImage =
      deployComputeMode === "lambda"
        ? (deployBuildEnvironment.lambdaBuildImage ??
          NODE_24_LAMBDA_BUILD_IMAGE)
        : codebuild.LinuxBuildImage.STANDARD_7_0;
    const deployComputeType =
      deployComputeMode === "lambda"
        ? (deployBuildEnvironment.lambdaComputeType ??
          codebuild.ComputeType.LAMBDA_4GB)
        : codebuild.ComputeType.SMALL;

    this.project = new codebuild.Project(this, "DeployProject", {
      description:
        "Validation and prod deploy runner for a monorepo app triggered by GitHub Actions through CodePipeline.",
      cache:
        deployComputeMode === "ec2"
          ? codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM)
          : undefined,
      environment: {
        buildImage: deployBuildImage,
        computeType: deployComputeType
      },
      environmentVariables: {
        AWS_DEFAULT_REGION: { value: props.region },
        AWS_REGION: { value: props.region },
        CI: { value: "true" },
        STACK_NAME: { value: props.deployStackName }
      },
      buildSpec: codebuild.BuildSpec.fromObject({ version: "0.2" }),
      projectName: props.projectName,
      role: serviceRole
    });
    const projectResource = this.project.node.defaultChild as codebuild.CfnProject;
    projectResource.addPropertyOverride("Artifacts", {
      Type: "CODEPIPELINE"
    });
    projectResource.addPropertyOverride("Source", {
      BuildSpec: props.buildSpecPath,
      Type: "CODEPIPELINE"
    });

    const sourceOutput = new codepipeline.Artifact("SourceArtifact");

    this.pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      pipelineType: codepipeline.PipelineType.V2,
      pipelineName: props.pipelineName,
      restartExecutionOnUpdate: false
    });
    this.pipeline.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["codeconnections:UseConnection"],
        resources: [this.connection.attrConnectionArn]
      })
    );

    const sourceStage = this.pipeline.addStage({ stageName: "Source" });
    sourceStage.addAction(
      new codepipelineActions.CodeStarConnectionsSourceAction({
        actionName: props.sourceActionName,
        branch: props.githubBranch,
        connectionArn: this.connection.attrConnectionArn,
        output: sourceOutput,
        owner: props.githubOwner,
        repo: props.githubRepo,
        triggerOnPush: false
      })
    );

    const prodStage = this.pipeline.addStage({ stageName: "Prod" });
    prodStage.addAction(
      new codepipelineActions.CodeBuildAction({
        actionName: "Deploy",
        input: sourceOutput,
        project: this.project,
        variablesNamespace: "ProdUrls"
      })
    );

    this.starterRole = new iam.Role(this, "GitHubActionsStarterRole", {
      assumedBy: new iam.WebIdentityPrincipal(
        this.oidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub": `repo:${props.githubActionsRepo}:ref:refs/heads/${props.githubActionsBranch}`
          }
        }
      ),
      roleName: `${props.pipelineName}-starter`
    });
    this.starterRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["codepipeline:StartPipelineExecution"],
        resources: [this.pipeline.pipelineArn]
      })
    );
  }
}
