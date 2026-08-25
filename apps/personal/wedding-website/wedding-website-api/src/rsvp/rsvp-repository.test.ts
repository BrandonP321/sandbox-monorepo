import { describe, expect, it } from "vitest";

import { rsvpSchemaVersion } from "@repo/wedding-website-shared";

import {
  InMemoryRsvpSubmissionRepository,
  type RsvpSubmissionRecord
} from "./rsvp-repository.js";

function submission(id = "3bb32b27-c576-4c70-8078-1285efcc908c") {
  return {
    submissionId: id,
    submittedAt: "2026-08-25T18:42:31.000Z",
    schemaVersion: rsvpSchemaVersion,
    guestSide: "niamh",
    adults: [
      {
        name: "Example Guest",
        attendance: "attending",
        contact: { email: "guest@example.test" }
      }
    ],
    childrenAttending: 0,
    contact: { email: "party@example.test" }
  } satisfies RsvpSubmissionRecord;
}

describe("InMemoryRsvpSubmissionRepository", () => {
  it("atomically creates, replays, and conflicts", async () => {
    const repository = new InMemoryRsvpSubmissionRepository();
    const first = await repository.createOrReplay({
      idempotencyKeyHash: "key-hash",
      requestHash: "request-hash",
      submission: submission()
    });
    const replay = await repository.createOrReplay({
      idempotencyKeyHash: "key-hash",
      requestHash: "request-hash",
      submission: submission("a7b606b8-e5d0-40a7-a023-f3597f1b1aa9")
    });
    const conflict = await repository.createOrReplay({
      idempotencyKeyHash: "key-hash",
      requestHash: "changed-hash",
      submission: submission("eef87228-f78c-483b-bfc7-3ced2c2cbe1c")
    });

    expect(first.kind).toBe("created");
    expect(replay).toEqual({
      kind: "replayed",
      result: {
        submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
        submittedAt: "2026-08-25T18:42:31.000Z",
        schemaVersion: 1
      }
    });
    expect(conflict).toEqual({ kind: "conflict" });
    expect(repository.getSubmissions()).toHaveLength(1);
  });

  it("allows identical guest data under distinct attempt identities", async () => {
    const repository = new InMemoryRsvpSubmissionRepository();
    await repository.createOrReplay({
      idempotencyKeyHash: "first-key",
      requestHash: "same-request",
      submission: submission()
    });
    await repository.createOrReplay({
      idempotencyKeyHash: "second-key",
      requestHash: "same-request",
      submission: submission("a7b606b8-e5d0-40a7-a023-f3597f1b1aa9")
    });

    expect(repository.getSubmissions()).toHaveLength(2);
  });

  it("stores immutable copies and does not expose internal records", async () => {
    const repository = new InMemoryRsvpSubmissionRepository();
    const input = submission();
    await repository.createOrReplay({
      idempotencyKeyHash: "key-hash",
      requestHash: "request-hash",
      submission: input
    });

    input.adults[0].name = "Mutated input";
    const firstSnapshot = repository.getSubmissions();
    firstSnapshot[0].adults[0].name = "Mutated snapshot";

    expect(repository.getSubmissions()[0].adults[0].name).toBe("Example Guest");
  });

  it("keeps concurrent exact attempts to one stored submission", async () => {
    const repository = new InMemoryRsvpSubmissionRepository();
    const results = await Promise.all([
      repository.createOrReplay({
        idempotencyKeyHash: "key-hash",
        requestHash: "request-hash",
        submission: submission()
      }),
      repository.createOrReplay({
        idempotencyKeyHash: "key-hash",
        requestHash: "request-hash",
        submission: submission("a7b606b8-e5d0-40a7-a023-f3597f1b1aa9")
      })
    ]);

    expect(results.map((result) => result.kind).sort()).toEqual([
      "created",
      "replayed"
    ]);
    expect(repository.getSubmissions()).toHaveLength(1);
  });
});
