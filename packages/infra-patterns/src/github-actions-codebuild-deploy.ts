import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codeconnections from "aws-cdk-lib/aws-codeconnections";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface GitHubActionsCodeBuildDeployProps {
  readonly buildSpecPath: string;
  readonly connectionName: string;
  readonly githubActionsBranch: string;
  readonly githubActionsRepo: string;
  readonly githubBranch: string;
  readonly githubOwner: string;
  readonly githubRepo: string;
  readonly projectName: string;
  readonly region: string;
}

export class GitHubActionsCodeBuildDeploy extends Construct {
  public readonly connection: codeconnections.CfnConnection;
  public readonly oidcProvider: iam.OpenIdConnectProvider;
  public readonly project: codebuild.Project;
  public readonly starterRole: iam.Role;

  constructor(
    scope: Construct,
    id: string,
    props: GitHubActionsCodeBuildDeployProps
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

    // Keep the initial deploy runner broad so CDK deploys do not fail on missing
    // service permissions while the monorepo CI/CD model is still being bootstrapped.
    serviceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
    );
    serviceRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "codeconnections:GetConnection",
          "codeconnections:GetConnectionToken",
          "codeconnections:UseConnection"
        ],
        resources: [this.connection.attrConnectionArn]
      })
    );

    this.project = new codebuild.Project(this, "DeployProject", {
      description:
        "Prod deploy runner for a monorepo app triggered by GitHub Actions.",
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      },
      environmentVariables: {
        AWS_DEFAULT_REGION: { value: props.region },
        AWS_REGION: { value: props.region },
        CI: { value: "true" }
      },
      projectName: props.projectName,
      role: serviceRole,
      source: codebuild.Source.gitHub({
        branchOrRef: props.githubBranch,
        cloneDepth: 1,
        owner: props.githubOwner,
        repo: props.githubRepo,
        reportBuildStatus: false,
        webhook: false
      }),
      buildSpec: codebuild.BuildSpec.fromSourceFilename(props.buildSpecPath)
    });

    const projectResource = this.project.node.defaultChild as codebuild.CfnProject;
    projectResource.addPropertyOverride("Source.Auth", {
      Resource: this.connection.attrConnectionArn,
      Type: "CODECONNECTIONS"
    });

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
      roleName: `${props.projectName}-starter`
    });
    this.starterRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["codebuild:BatchGetBuilds", "codebuild:StartBuild"],
        resources: [this.project.projectArn]
      })
    );
  }
}
