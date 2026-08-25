import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";

import {
  GitHubActionsCodePipelineDeploy,
  importGitHubActionsOidcProviderArn,
  importDomainFoundation,
  SpaSite,
  type SpaSiteCustomDomainProps
} from "@repo/infra-patterns";

const WEDDING_WEBSITE_DOMAIN_NAME = "wedding.bphillips.dev";

export interface WeddingWebsiteStackProps extends cdk.StackProps {
  readonly customDomain?: SpaSiteCustomDomainProps;
  readonly useSharedDomain?: boolean;
}

export class WeddingWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: WeddingWebsiteStackProps) {
    super(scope, id, props);

    const deployPipeline = new GitHubActionsCodePipelineDeploy(
      this,
      "WeddingWebsiteCiCd",
      {
        buildSpecPath:
          "apps/personal/wedding-website/wedding-website-infra/buildspec.prod.yml",
        connectionName: "wedding-website-prod-source",
        deployBuildEnvironment: { computeMode: "lambda" },
        deployStackName: "WeddingWebsiteStack",
        githubActionsBranch: "main",
        githubActionsRepo: "BrandonP321/sandbox-monorepo",
        githubOidcProviderArn: importGitHubActionsOidcProviderArn(),
        githubBranch: "main",
        githubOwner: "BrandonP321",
        githubRepo: "sandbox-monorepo",
        pipelineName: "wedding-website-prod",
        projectName: "wedding-website-prod-deploy",
        region: "us-east-1",
        sourceActionName: "Source",
        validationBuildSpecPath:
          "apps/personal/wedding-website/wedding-website-infra/buildspec.validate.yml"
      }
    );

    const site = new SpaSite(this, "WeddingWebsiteSite", {
      customDomain:
        props?.customDomain ??
        (props?.useSharedDomain
          ? createWeddingWebsiteCustomDomain(this)
          : undefined),
      defaultBehavior: {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: site.publicUrl
    });

    new cdk.CfnOutput(this, "WebBucketName", {
      value: site.bucket.bucketName
    });

    new cdk.CfnOutput(this, "WebDistributionId", {
      value: site.distribution.distributionId
    });

    new cdk.CfnOutput(this, "WeddingWebsiteDeployPipelineName", {
      value: deployPipeline.pipeline.pipelineName
    });

    new cdk.CfnOutput(this, "WeddingWebsiteDeployProjectName", {
      value: deployPipeline.project.projectName
    });

    new cdk.CfnOutput(this, "WeddingWebsiteGitHubActionsRoleArn", {
      value: deployPipeline.starterRole.roleArn
    });

    new cdk.CfnOutput(this, "WeddingWebsiteGitHubConnectionArn", {
      value: deployPipeline.connection.attrConnectionArn
    });

    new cdk.CfnOutput(this, "WeddingWebsiteGitHubConnectionStatus", {
      value: deployPipeline.connection.attrConnectionStatus
    });
  }
}

function createWeddingWebsiteCustomDomain(
  scope: cdk.Stack
): SpaSiteCustomDomainProps {
  const foundation = importDomainFoundation(scope, "WeddingWebsiteDomain", {
    domainName: "bphillips.dev"
  });

  return {
    certificate: foundation.certificate,
    dns: { hostedZone: foundation.hostedZone },
    domainNames: [WEDDING_WEBSITE_DOMAIN_NAME]
  };
}
