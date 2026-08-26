import type {
  GetCommandInput,
  TransactWriteCommandInput
} from "@aws-sdk/lib-dynamodb";
import { describe, expect, it, vi } from "vitest";

import type { ApiRequest } from "@repo/api-core";

import type { RsvpDynamoDbClient } from "../rsvp/dynamodb-rsvp-repository.js";
import { createProductionWeddingWebsiteApiDependencies } from "./production-dependencies.js";
import { createWeddingWebsiteAppRouter } from "./router.js";

class NoopRsvpDynamoDbClient implements RsvpDynamoDbClient {
  transactionCalls = 0;
  transactionError?: unknown;

  async transactWrite(input: TransactWriteCommandInput): Promise<void> {
    void input;
    this.transactionCalls += 1;
    if (this.transactionError) {
      throw this.transactionError;
    }
  }

  async get(
    input: GetCommandInput
  ): Promise<Record<string, unknown> | undefined> {
    void input;
    return undefined;
  }
}

function validRequest(): ApiRequest {
  return {
    method: "POST",
    path: "/rsvp",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "7ad1a5a8-8e35-4d9d-99b0-21181700cb95"
    },
    body: JSON.stringify({
      guestSide: "niamh",
      adults: [
        {
          name: "Synthetic Guest",
          attendance: "attending",
          contact: { email: "synthetic@example.test" }
        }
      ],
      childrenAttending: 0,
      contact: { email: "party@example.test" }
    }),
    requestId: "request-1"
  };
}

describe("createProductionWeddingWebsiteApiDependencies", () => {
  it("fails closed with a safe 503 when RSVP_TABLE_NAME is missing", async () => {
    const client = new NoopRsvpDynamoDbClient();
    const dependencies = createProductionWeddingWebsiteApiDependencies({
      client,
      env: {}
    });
    const router = createWeddingWebsiteAppRouter(dependencies);

    const response = await router(validRequest());

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body)).toEqual({
      error: {
        code: "PERSISTENCE_UNAVAILABLE",
        message: "Submission service is temporarily unavailable."
      }
    });
    expect(client.transactionCalls).toBe(0);
  });

  it("does not include RSVP PII or keys in production persistence diagnostics", async () => {
    const client = new NoopRsvpDynamoDbClient();
    const logger = vi.fn();
    client.transactionError = Object.assign(
      new Error("PRODUCTION_PRIVATE_MARKER_82"),
      {
        name: "ValidationException",
        $fault: "client",
        $metadata: {
          httpStatusCode: 400,
          requestId: "aws-request-production-82",
          attempts: 1,
          totalRetryDelay: 0
        }
      }
    );
    const request = validRequest();
    request.body = JSON.stringify({
      guestSide: "niamh",
      adults: [
        {
          name: "PRODUCTION_PRIVATE_MARKER_82",
          attendance: "attending",
          contact: { email: "production-private-82@example.test" }
        }
      ],
      childrenAttending: 2,
      contact: { phone: "+1 202 555 0182" },
      generalNote: "PRODUCTION_PRIVATE_NOTE_82"
    });
    const dependencies = createProductionWeddingWebsiteApiDependencies({
      client,
      env: { RSVP_TABLE_NAME: "rsvp-table" },
      logger
    });
    const router = createWeddingWebsiteAppRouter(dependencies);

    const response = await router(request);

    expect(response.statusCode).toBe(503);
    expect(logger).toHaveBeenCalledWith({
      level: "error",
      event: "rsvp_persistence_error",
      operation: "transact_write",
      errorName: "ValidationException",
      errorClass: "Error",
      fault: "client",
      httpStatusCode: 400,
      requestId: "aws-request-production-82",
      extendedRequestId: undefined,
      attempts: 1,
      totalRetryDelay: 0
    });
    const logs = JSON.stringify(logger.mock.calls);
    expect(logs).not.toContain("PRODUCTION_PRIVATE_MARKER_82");
    expect(logs).not.toContain("production-private-82@example.test");
    expect(logs).not.toContain("+1 202 555 0182");
    expect(logs).not.toContain("PRODUCTION_PRIVATE_NOTE_82");
    expect(logs).not.toContain(
      request.headers?.["idempotency-key"] ?? "missing-idempotency-key"
    );
  });
});
