import { describe, expect, it } from "vitest";

import {
  GitHubActionsCodePipelineDeploy,
  HttpLambdaApi,
  GITHUB_ACTIONS_OIDC_PROVIDER_ARN_EXPORT_NAME,
  GITHUB_ACTIONS_OIDC_PROVIDER_URL,
  importGitHubActionsOidcProviderArn,
  importDomainFoundation,
  SpaSite
} from "./index";

describe("infra-patterns exports", () => {
  it("exports reusable patterns", () => {
    expect(GitHubActionsCodePipelineDeploy).toBeTypeOf("function");
    expect(GITHUB_ACTIONS_OIDC_PROVIDER_ARN_EXPORT_NAME).toBe(
      "sandbox-github-actions-oidc-provider-arn"
    );
    expect(GITHUB_ACTIONS_OIDC_PROVIDER_URL).toBe(
      "https://token.actions.githubusercontent.com"
    );
    expect(HttpLambdaApi).toBeTypeOf("function");
    expect(importDomainFoundation).toBeTypeOf("function");
    expect(importGitHubActionsOidcProviderArn).toBeTypeOf("function");
    expect(SpaSite).toBeTypeOf("function");
  });
});
