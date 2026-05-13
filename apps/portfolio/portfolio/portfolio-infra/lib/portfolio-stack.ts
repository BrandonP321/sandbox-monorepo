import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { GitHubActionsCodePipelineDeploy, SpaSite } from "@repo/infra-patterns";

export class PortfolioStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deployPipeline = new GitHubActionsCodePipelineDeploy(
      this,
      "PortfolioCiCd",
      {
        buildSpecPath:
          "apps/portfolio/portfolio/portfolio-infra/buildspec.prod.yml",
        connectionName: "portfolio-prod-source",
        deployBuildEnvironment: { computeMode: "lambda" },
        deployStackName: "PortfolioStack",
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
        pipelineName: "portfolio-prod",
        projectName: "portfolio-prod-deploy",
        region: "us-east-1",
        sourceActionName: "Source",
        validationBuildSpecPath:
          "apps/portfolio/portfolio/portfolio-infra/buildspec.validate.yml"
      }
    );

    const site = new SpaSite(this, "PortfolioSite");

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${site.distribution.domainName}`
    });

    new cdk.CfnOutput(this, "WebBucketName", {
      value: site.bucket.bucketName
    });

    new cdk.CfnOutput(this, "WebDistributionId", {
      value: site.distribution.distributionId
    });

    new cdk.CfnOutput(this, "PortfolioDeployPipelineName", {
      value: deployPipeline.pipeline.pipelineName
    });

    new cdk.CfnOutput(this, "PortfolioDeployProjectName", {
      value: deployPipeline.project.projectName
    });

    new cdk.CfnOutput(this, "PortfolioGitHubActionsRoleArn", {
      value: deployPipeline.starterRole.roleArn
    });

    new cdk.CfnOutput(this, "PortfolioGitHubConnectionArn", {
      value: deployPipeline.connection.attrConnectionArn
    });

    new cdk.CfnOutput(this, "PortfolioGitHubConnectionStatus", {
      value: deployPipeline.connection.attrConnectionStatus
    });
  }
}
