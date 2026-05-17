import { describe, expect, it } from "vitest";

import {
  GitHubActionsCodePipelineDeploy,
  HttpLambdaApi,
  importDomainFoundation,
  SpaSite
} from "./index";

describe("infra-patterns exports", () => {
  it("exports reusable patterns", () => {
    expect(GitHubActionsCodePipelineDeploy).toBeTypeOf("function");
    expect(HttpLambdaApi).toBeTypeOf("function");
    expect(importDomainFoundation).toBeTypeOf("function");
    expect(SpaSite).toBeTypeOf("function");
  });
});
