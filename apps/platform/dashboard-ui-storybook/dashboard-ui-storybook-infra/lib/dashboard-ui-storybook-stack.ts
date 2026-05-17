import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { Construct } from "constructs";

import {
  GitHubActionsCodePipelineDeploy,
  importDomainFoundation,
  SpaSite,
  type SpaSiteCustomDomainProps
} from "@repo/infra-patterns";

export interface DashboardUiStorybookStackProps extends cdk.StackProps {
  readonly customDomain?: SpaSiteCustomDomainProps;
  readonly useSharedDomain?: boolean;
}

export class DashboardUiStorybookStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: DashboardUiStorybookStackProps
  ) {
    super(scope, id, props);

    const storybookBuildEnvironment = {
      computeMode: "ec2",
      ec2BuildImage: codebuild.LinuxBuildImage.fromCodeBuildImageId(
        "aws/codebuild/standard:8.0"
      )
    } as const;

    const deployPipeline = new GitHubActionsCodePipelineDeploy(
      this,
      "DashboardUiStorybookCiCd",
      {
        buildSpecPath:
          "apps/platform/dashboard-ui-storybook/dashboard-ui-storybook-infra/buildspec.prod.yml",
        connectionName: "dash-ui-storybook-prod-source",
        deployBuildEnvironment: storybookBuildEnvironment,
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
          "apps/platform/dashboard-ui-storybook/dashboard-ui-storybook-infra/buildspec.validate.yml",
        validationBuildEnvironment: storybookBuildEnvironment
      }
    );

    const site = new SpaSite(this, "DashboardUiStorybookSite", {
      customDomain:
        props?.customDomain ??
        (props?.useSharedDomain
          ? createDashboardUiStorybookCustomDomain(this)
          : undefined)
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

function createDashboardUiStorybookCustomDomain(
  scope: cdk.Stack
): SpaSiteCustomDomainProps {
  const foundation = importDomainFoundation(
    scope,
    "DashboardUiStorybookDomain",
    {
      domainName: "bphillips.dev"
    }
  );

  return {
    certificate: foundation.certificate,
    dns: { hostedZone: foundation.hostedZone },
    domainNames: [`dashboard-ui.${foundation.domainName}`]
  };
}
