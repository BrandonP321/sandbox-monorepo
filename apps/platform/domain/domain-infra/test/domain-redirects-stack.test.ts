import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { runInNewContext } from "node:vm";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { DomainRedirectsStack } from "../lib/domain-redirects-stack.js";
import { redirects, redirectFunctionCode } from "../lib/redirects.js";

const host = "actions.bphillips.dev";
const code = redirectFunctionCode(redirects);
interface Response {
  statusCode: number;
  headers: Record<string, { value: string }>;
}
function request(
  hostname: string | undefined = host,
  uri = "/",
  method = "GET"
): Response {
  return runInNewContext(`${code}; handler(event)`, {
    event: {
      request: {
        headers:
          hostname === undefined
            ? {}
            : {
                host: { value: hostname },
                "x-forwarded-host": { value: "evil.example" }
              },
        uri,
        method,
        querystring: {
          next: { value: "https://evil.example" },
          token: { value: "private" }
        }
      }
    }
  }) as Response;
}

describe("temporary redirect contract", () => {
  it("redirects GET/HEAD to the fixed HTTPS root without queries or caching", () => {
    for (const method of ["GET", "HEAD"]) {
      const result = request(host, "/", method);
      expect(result.statusCode).toBe(302);
      expect(result.headers.location?.value).toBe(redirects[host]);
      expect(result.headers["cache-control"]?.value).toContain("no-store");
      expect(result.headers["referrer-policy"]?.value).toBe("no-referrer");
    }
  });
  it("rejects unknown hosts, prototype keys, paths and methods without Location", () => {
    for (const hostname of [
      "",
      "evil.example",
      "actions.bphillips.dev.evil.example",
      "__proto__",
      "constructor",
      "d123.cloudfront.net"
    ]) {
      const result = request(hostname);
      expect(result.statusCode).toBe(404);
      expect(result.headers.location).toBeUndefined();
    }
    for (const uri of [
      "/unknown",
      "//evil.example",
      "/%2f%2fevil.example",
      "/https://evil.example"
    ]) {
      expect(request(host, uri).statusCode).toBe(404);
      expect(request(host, uri).headers.location).toBeUndefined();
    }
    expect(request(host, "/", "POST").statusCode).toBe(405);
    expect(request(host, "/", "POST").headers.location).toBeUndefined();
    expect(
      runInNewContext(`${code}; handler(event)`, {
        event: { request: { headers: {}, uri: "/", method: "GET" } }
      }).statusCode
    ).toBe(404);
  });
  it("rejects unsafe configuration before provisioning", () => {
    for (const destination of [
      "http://x.brandonp321.chatgpt.site/",
      "https://evil.example/",
      "https://x.brandonp321.chatgpt.site.evil.example/",
      "https://u:p@x.brandonp321.chatgpt.site/",
      "https://x.brandonp321.chatgpt.site/?token=x",
      "https://x.brandonp321.chatgpt.site/#fragment",
      "https://x.brandonp321.chatgpt.site/path",
      "https://x.brandonp321.chatgpt.site:444/",
      "javascript:alert(1)"
    ]) {
      expect(() => redirectFunctionCode({ [host]: destination })).toThrow();
    }
    expect(() => redirectFunctionCode({})).toThrow();
    expect(() =>
      redirectFunctionCode({ "*.bphillips.dev": redirects[host]! })
    ).toThrow();
  });
});

it("synthesizes only edge and alias resources, sharing DNS/TLS without IAM", () => {
  const app = new cdk.App();
  const stack = new DomainRedirectsStack(app, "DomainRedirectsStack", {
    env: { account: "498283327683", region: "us-east-1" }
  });
  const template = Template.fromStack(stack);
  const resources = template.toJSON().Resources as Record<
    string,
    { Type: string }
  >;
  expect(
    Object.values(resources)
      .map((r) => r.Type)
      .sort()
  ).toEqual([
    "AWS::CloudFront::Distribution",
    "AWS::CloudFront::Function",
    "AWS::Route53::RecordSet",
    "AWS::Route53::RecordSet"
  ]);
  template.hasResourceProperties("AWS::CloudFront::Distribution", {
    DistributionConfig: {
      Aliases: [host],
      IPV6Enabled: true,
      ViewerCertificate: {
        AcmCertificateArn: {
          "Fn::ImportValue": "sandbox-domain-certificate-arn"
        },
        MinimumProtocolVersion: "TLSv1.2_2021",
        SslSupportMethod: "sni-only"
      },
      DefaultCacheBehavior: Match.objectLike({
        ViewerProtocolPolicy: "allow-all",
        AllowedMethods: ["GET", "HEAD"],
        CachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
        FunctionAssociations: [
          Match.objectLike({ EventType: "viewer-request" })
        ]
      }),
      Origins: [
        Match.objectLike({
          DomainName: "redirect-origin.invalid",
          CustomOriginConfig: Match.objectLike({
            OriginProtocolPolicy: "https-only"
          })
        })
      ]
    }
  });
  for (const type of ["A", "AAAA"])
    template.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: host,
      Type: type,
      HostedZoneId: { "Fn::ImportValue": "sandbox-domain-hosted-zone-id" },
      AliasTarget: Match.objectLike({
        HostedZoneId: "Z2FDTNDATAQYW2",
        EvaluateTargetHealth: false
      })
    });
});

it("domain-only paths do not select any existing application pipeline", () => {
  const root = resolve(__dirname, "../../../../..");
  // Load the actual detector without its CLI side effect.
  const source = readFileSync(
    resolve(root, "scripts/project-changed.mjs"),
    "utf8"
  );
  const detector = source
    .slice(
      source.indexOf("export function determineProjectChange"),
      source.indexOf("function listChangedFiles")
    )
    .replace("export ", "");
  for (const file of readdirSync(resolve(root, ".github/workflows"))) {
    const workflow = readFileSync(
      resolve(root, ".github/workflows", file),
      "utf8"
    );
    const projectRoot = /project_root: (apps\/[^\s]+)/.exec(workflow)?.[1];
    if (!projectRoot) continue;
    expect(workflow).toContain('"!apps/**"');
    const result = runInNewContext(
      `${detector}; determineProjectChange(input)`,
      {
        input: {
          changedFiles: ["apps/platform/domain/domain-infra/lib/redirects.ts"],
          projectRoot
        }
      }
    );
    expect(result.shouldRun, file).toBe(false);
  }
});
