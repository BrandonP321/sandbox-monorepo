import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

import {
  createPreviewAccessGateCode,
  PREVIEW_USERNAME
} from "../lib/preview-access-gate.js";

interface CloudFrontRequest {
  readonly headers: Record<string, { value: string } | undefined>;
  readonly uri: string;
}

interface UnauthorizedResponse {
  readonly headers: Record<string, { value: string }>;
  readonly statusCode: number;
  readonly statusDescription: string;
}

type GateResult = CloudFrontRequest | UnauthorizedResponse;

describe("preview access gate", () => {
  const password = "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6";

  it.each([
    ["missing", undefined],
    ["malformed", "Bearer not-basic-auth"],
    ["incorrect", basicAuthorization(PREVIEW_USERNAME, `${password}wrong`)]
  ])("denies a %s authorization header", (_description, authorization) => {
    const result = runGate(password, authorization);

    expect(result).toEqual({
      statusCode: 401,
      statusDescription: "Unauthorized",
      headers: {
        "cache-control": { value: "no-store" },
        "www-authenticate": {
          value: 'Basic realm="Wedding preview", charset="UTF-8"'
        }
      }
    });
  });

  it("allows a request with the expected Basic Auth credentials", () => {
    const authorization = basicAuthorization(PREVIEW_USERNAME, password);

    const result = runGate(password, authorization);

    expect(result).toEqual({
      headers: { authorization: { value: authorization } },
      uri: "/assets/site.js"
    });
  });
});

function runGate(password: string, authorization?: string): GateResult {
  const code = createPreviewAccessGateCode(password);
  const handler = runInNewContext(`${code}\nhandler`, {
    btoa: (value: string) => Buffer.from(value, "utf8").toString("base64")
  }) as (event: { request: CloudFrontRequest }) => GateResult;
  const request: CloudFrontRequest = {
    headers: authorization ? { authorization: { value: authorization } } : {},
    uri: "/assets/site.js"
  };

  return handler({ request });
}

function basicAuthorization(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}
