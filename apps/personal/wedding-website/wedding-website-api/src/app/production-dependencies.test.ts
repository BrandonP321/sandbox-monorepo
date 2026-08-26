import type {
  GetCommandInput,
  TransactWriteCommandInput
} from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import type { ApiRequest } from "@repo/api-core";

import type { RsvpDynamoDbClient } from "../rsvp/dynamodb-rsvp-repository.js";
import { createProductionWeddingWebsiteApiDependencies } from "./production-dependencies.js";
import { createWeddingWebsiteAppRouter } from "./router.js";

class NoopRsvpDynamoDbClient implements RsvpDynamoDbClient {
  transactionCalls = 0;

  async transactWrite(input: TransactWriteCommandInput): Promise<void> {
    void input;
    this.transactionCalls += 1;
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
});
