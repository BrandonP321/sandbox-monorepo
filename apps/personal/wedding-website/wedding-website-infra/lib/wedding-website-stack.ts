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

import { createPreviewAccessGateCode } from "./preview-access-gate.js";

const WEDDING_WEBSITE_DOMAIN_NAME = "wedding.bphillips.dev";

export interface WeddingWebsiteStackProps extends cdk.StackProps {
  readonly customDomain?: SpaSiteCustomDomainProps;
  readonly useSharedDomain?: boolean;
}

export class WeddingWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: WeddingWebsiteStackProps) {
    super(scope, id, props);

    const previewPassword = new cdk.CfnParameter(this, "PreviewPassword", {
      allowedPattern: "^[A-Za-z0-9]{32,128}$",
      constraintDescription:
        "The preview password must contain 32 to 128 letters or numbers.",
      description:
        "Temporary wedding preview password supplied from AWS Secrets Manager.",
      noEcho: true,
      type: "String"
    });

    const previewAccessGate = new cloudfront.Function(
      this,
      "PreviewAccessGate",
      {
        code: cloudfront.FunctionCode.fromInline(
          createPreviewAccessGateCode(previewPassword.valueAsString)
        ),
        comment: "Temporary HTTP Basic Auth gate for the wedding preview.",
        runtime: cloudfront.FunctionRuntime.JS_2_0
      }
    );

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
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: previewAccessGate
          }
        ],
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
