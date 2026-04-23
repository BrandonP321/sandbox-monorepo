import { describe, expect, it } from "vitest";

import {
  GitHubActionsCodeBuildDeploy,
  HttpLambdaApi,
  SpaSite
} from "./index";

describe("infra-patterns exports", () => {
  it("exports reusable patterns", () => {
    expect(GitHubActionsCodeBuildDeploy).toBeTypeOf("function");
    expect(HttpLambdaApi).toBeTypeOf("function");
    expect(SpaSite).toBeTypeOf("function");
  });
});
