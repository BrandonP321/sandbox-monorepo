import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { GitHubActionsCodePipelineDeploy, SpaSite } from "@repo/infra-patterns";

export class DashboardUiStorybookStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deployPipeline = new GitHubActionsCodePipelineDeploy(
      this,
      "DashboardUiStorybookCiCd",
      {
        buildSpecPath:
          "apps/platform/dashboard-ui-storybook/dashboard-ui-storybook-infra/buildspec.prod.yml",
        connectionName: "dash-ui-storybook-prod-source",
        deployBuildEnvironment: { computeMode: "lambda" },
        deployStackName: "DashboardUiStorybookStack",
        githubActionsBranch: "main",
        githubActionsRepo: "BrandonP321/sandbox-monorepo",
        githubOidcProviderArn: cdk.Arn.format(
          {
            service: "iam",
            region: "",
            account: cdk.Stack.of(this).account,
            resource: "oidc-provider",
            resourceName: "token.actions.githubusercontent.com"
          },
          this
        ),
        githubBranch: "main",
        githubOwner: "BrandonP321",
        githubRepo: "sandbox-monorepo",
        pipelineName: "dashboard-ui-storybook-prod",
        projectName: "dashboard-ui-storybook-prod-deploy",
        region: "us-east-1",
        sourceActionName: "Source",
        validationBuildSpecPath:
          "apps/platform/dashboard-ui-storybook/dashboard-ui-storybook-infra/buildspec.validate.yml"
      }
    );

    const site = new SpaSite(this, "DashboardUiStorybookSite");

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${site.distribution.domainName}`
    });

    new cdk.CfnOutput(this, "WebBucketName", {
      value: site.bucket.bucketName
    });

    new cdk.CfnOutput(this, "WebDistributionId", {
      value: site.distribution.distributionId
    });

    new cdk.CfnOutput(this, "DashboardUiStorybookDeployPipelineName", {
      value: deployPipeline.pipeline.pipelineName
    });

    new cdk.CfnOutput(this, "DashboardUiStorybookDeployProjectName", {
      value: deployPipeline.project.projectName
    });

    new cdk.CfnOutput(this, "DashboardUiStorybookGitHubActionsRoleArn", {
      value: deployPipeline.starterRole.roleArn
    });

    new cdk.CfnOutput(this, "DashboardUiStorybookGitHubConnectionArn", {
      value: deployPipeline.connection.attrConnectionArn
    });

    new cdk.CfnOutput(this, "DashboardUiStorybookGitHubConnectionStatus", {
      value: deployPipeline.connection.attrConnectionStatus
    });
  }
}
