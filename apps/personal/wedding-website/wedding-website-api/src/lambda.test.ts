import { describe, expect, it } from "vitest";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

import { toApiRequest } from "./lambda.js";

describe("toApiRequest", () => {
  it("decodes base64 request bodies before application validation", () => {
    const body = JSON.stringify({ message: "héllo" });
    const request = toApiRequest({
      version: "2.0",
      routeKey: "POST /rsvp",
      rawPath: "/rsvp",
      rawQueryString: "",
      headers: { "content-type": "application/json" },
      requestContext: {
        accountId: "account",
        apiId: "api",
        domainName: "localhost",
        domainPrefix: "localhost",
        http: {
          method: "POST",
          path: "/rsvp",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "test"
        },
        requestId: "request-1",
        routeKey: "POST /rsvp",
        stage: "$default",
        time: "time",
        timeEpoch: 0
      },
      body: Buffer.from(body).toString("base64"),
      isBase64Encoded: true
    } satisfies APIGatewayProxyEventV2);

    expect(request.body).toBe(body);
    expect(request.requestId).toBe("request-1");
  });
});
