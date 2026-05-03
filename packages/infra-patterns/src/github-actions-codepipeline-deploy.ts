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
  readonly validationActions?: readonly CodePipelineDeployValidationActionProps[];
  readonly validationBuildEnvironment?: CodePipelineDeployBuildEnvironmentProps;
  readonly validationBuildSpecPath?: string;
  readonly validationProjectConstructId?: string;
  readonly validationProjectName?: string;
}

export interface CodePipelineDeployValidationActionProps {
  readonly actionName: string;
  readonly buildEnvironment?: CodePipelineDeployBuildEnvironmentProps;
  readonly buildSpecPath: string;
  readonly projectConstructId?: string;
  readonly projectName?: string;
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
  public readonly validationProject?: codebuild.Project;
  public readonly validationProjects: readonly codebuild.Project[];

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

    this.project = this.createBuildProject(
      "DeployProject",
      props.projectName,
      "Prod deploy runner for a monorepo app triggered by GitHub Actions through CodePipeline.",
      props.buildSpecPath,
      props.deployBuildEnvironment,
      props,
      serviceRole
    );

    const validationActions = resolveValidationActions(props);
    this.validationProjects = validationActions.map((validationAction) =>
      this.createBuildProject(
        validationAction.projectConstructId,
        validationAction.projectName,
        "Validation runner for a monorepo app triggered by GitHub Actions through CodePipeline.",
        validationAction.buildSpecPath,
        validationAction.buildEnvironment,
        props,
        serviceRole
      )
    );
    this.validationProject = this.validationProjects[0];

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

    if (this.validationProjects.length > 0) {
      const validateStage = this.pipeline.addStage({ stageName: "Validate" });
      for (const [
        index,
        validationProject
      ] of this.validationProjects.entries()) {
        validateStage.addAction(
          new codepipelineActions.CodeBuildAction({
            actionName: validationActions[index].actionName,
            input: sourceOutput,
            project: validationProject
          })
        );
      }
    }

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

  private createBuildProject(
    id: string,
    projectName: string,
    description: string,
    buildSpecPath: string,
    buildEnvironment: CodePipelineDeployBuildEnvironmentProps | undefined,
    props: GitHubActionsCodePipelineDeployProps,
    role: iam.IRole
  ): codebuild.Project {
    const resolvedBuildEnvironment =
      buildEnvironment ??
      ({} satisfies CodePipelineDeployBuildEnvironmentProps);
    const computeMode = resolvedBuildEnvironment.computeMode ?? "ec2";
    const buildImage =
      computeMode === "lambda"
        ? (resolvedBuildEnvironment.lambdaBuildImage ??
          NODE_24_LAMBDA_BUILD_IMAGE)
        : codebuild.LinuxBuildImage.STANDARD_7_0;
    const computeType =
      computeMode === "lambda"
        ? (resolvedBuildEnvironment.lambdaComputeType ??
          codebuild.ComputeType.LAMBDA_4GB)
        : codebuild.ComputeType.SMALL;

    const project = new codebuild.Project(this, id, {
      description,
      cache:
        computeMode === "ec2"
          ? codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM)
          : undefined,
      environment: {
        buildImage,
        computeType
      },
      environmentVariables: {
        AWS_DEFAULT_REGION: { value: props.region },
        AWS_REGION: { value: props.region },
        CI: { value: "true" },
        STACK_NAME: { value: props.deployStackName }
      },
      buildSpec: codebuild.BuildSpec.fromObject({ version: "0.2" }),
      projectName,
      role
    });
    const projectResource = project.node.defaultChild as codebuild.CfnProject;
    projectResource.addPropertyOverride("Artifacts", {
      Type: "CODEPIPELINE"
    });
    projectResource.addPropertyOverride("Source", {
      BuildSpec: buildSpecPath,
      Type: "CODEPIPELINE"
    });

    return project;
  }
}

interface ResolvedValidationAction {
  readonly actionName: string;
  readonly buildEnvironment:
    | CodePipelineDeployBuildEnvironmentProps
    | undefined;
  readonly buildSpecPath: string;
  readonly projectConstructId: string;
  readonly projectName: string;
}

function resolveValidationActions(
  props: GitHubActionsCodePipelineDeployProps
): readonly ResolvedValidationAction[] {
  if (props.validationActions) {
    return props.validationActions.map((validationAction) => ({
      actionName: validationAction.actionName,
      buildEnvironment:
        validationAction.buildEnvironment ??
        props.validationBuildEnvironment ??
        props.deployBuildEnvironment,
      buildSpecPath: validationAction.buildSpecPath,
      projectConstructId:
        validationAction.projectConstructId ??
        `Validate${toConstructIdPart(validationAction.actionName)}Project`,
      projectName:
        validationAction.projectName ??
        `${props.pipelineName}-validate-${toProjectNamePart(validationAction.actionName)}`
    }));
  }

  if (!props.validationBuildSpecPath) {
    return [];
  }

  return [
    {
      actionName: "Validate",
      buildEnvironment:
        props.validationBuildEnvironment ?? props.deployBuildEnvironment,
      buildSpecPath: props.validationBuildSpecPath,
      projectConstructId:
        props.validationProjectConstructId ?? "ValidateProject",
      projectName:
        props.validationProjectName ?? `${props.pipelineName}-validate`
    }
  ];
}

function toConstructIdPart(value: string): string {
  const sanitized = value.replace(/[^A-Za-z0-9]/g, "");
  return sanitized.length > 0 ? sanitized : "Action";
}

function toProjectNamePart(value: string): string {
  const sanitized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return sanitized.replace(/^-|-$/g, "") || "action";
}
