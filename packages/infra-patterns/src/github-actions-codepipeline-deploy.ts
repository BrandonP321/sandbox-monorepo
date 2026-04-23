import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codeconnections from "aws-cdk-lib/aws-codeconnections";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipelineActions from "aws-cdk-lib/aws-codepipeline-actions";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface GitHubActionsCodePipelineDeployProps {
  readonly validateBuildSpecPath: string;
  readonly validateProjectName: string;
  readonly buildSpecPath: string;
  readonly connectionName: string;
  readonly githubActionsBranch: string;
  readonly githubActionsRepo: string;
  readonly githubBranch: string;
  readonly githubOwner: string;
  readonly githubRepo: string;
  readonly pipelineName: string;
  readonly projectName: string;
  readonly region: string;
  readonly sourceActionName: string;
}

export class GitHubActionsCodePipelineDeploy extends Construct {
  public readonly connection: codeconnections.CfnConnection;
  public readonly oidcProvider: iam.OpenIdConnectProvider;
  public readonly pipeline: codepipeline.Pipeline;
  public readonly validationProject: codebuild.Project;
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

    this.oidcProvider = new iam.OpenIdConnectProvider(this, "GitHubOidc", {
      clientIds: ["sts.amazonaws.com"],
      url: "https://token.actions.githubusercontent.com"
    });

    const serviceRole = new iam.Role(this, "CodeBuildServiceRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com")
    });

    const validationServiceRole = new iam.Role(this, "ValidationCodeBuildServiceRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com")
    });

    // Keep the initial deploy runner broad so CDK deploys do not fail on missing
    // service permissions while the monorepo CI/CD model is still being bootstrapped.
    serviceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
    );

    this.validationProject = new codebuild.Project(this, "ValidationProject", {
      description:
        "Validation runner for a monorepo app triggered by GitHub Actions through CodePipeline.",
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      },
      environmentVariables: {
        AWS_DEFAULT_REGION: { value: props.region },
        AWS_REGION: { value: props.region },
        CI: { value: "true" }
      },
      buildSpec: codebuild.BuildSpec.fromObject({ version: "0.2" }),
      projectName: props.validateProjectName,
      role: validationServiceRole
    });
    const validationProjectResource =
      this.validationProject.node.defaultChild as codebuild.CfnProject;
    validationProjectResource.addPropertyOverride("Artifacts", {
      Type: "CODEPIPELINE"
    });
    validationProjectResource.addPropertyOverride("Source", {
      BuildSpec: props.validateBuildSpecPath,
      Type: "CODEPIPELINE"
    });

    this.project = new codebuild.Project(this, "DeployProject", {
      description:
        "Prod deploy runner for a monorepo app triggered by GitHub Actions through CodePipeline.",
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      },
      environmentVariables: {
        AWS_DEFAULT_REGION: { value: props.region },
        AWS_REGION: { value: props.region },
        CI: { value: "true" }
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

    const validateStage = this.pipeline.addStage({ stageName: "Validate" });
    validateStage.addAction(
      new codepipelineActions.CodeBuildAction({
        actionName: "Validate",
        input: sourceOutput,
        project: this.validationProject
      })
    );

    const prodStage = this.pipeline.addStage({ stageName: "Prod" });
    prodStage.addAction(
      new codepipelineActions.CodeBuildAction({
        actionName: "Deploy",
        input: sourceOutput,
        project: this.project
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
