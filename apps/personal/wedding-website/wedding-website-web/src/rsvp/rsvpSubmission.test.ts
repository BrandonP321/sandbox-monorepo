import { describe, expect, it, vi } from "vitest";

import { addAdult, createInitialDraft, updateAdult } from "./rsvpDraft";
import {
  createRsvpRequestHash,
  mapDraftToRsvpSubmission,
  resolveUnresolvedRsvpAttempt,
  type RsvpSubmissionCrypto
} from "./rsvpSubmission";
import type { RsvpDraft } from "./rsvpTypes";

const FIRST_ATTEMPT_KEY = "7ad1a5a8-8e35-4d9d-99b0-21181700cb95";
const SECOND_ATTEMPT_KEY = "80270f39-dca2-48b2-b882-25364e116a8d";
const LATER_ATTEMPT_KEY = "ef328aac-6f84-48b6-9e20-814e3c8c9d5b";

function createValidDraft(): RsvpDraft {
  let draft = addAdult(createInitialDraft());
  draft = {
    ...draft,
    guestSide: "niamh",
    childrenAttending: 2,
    contact: { email: " Party@Example.Test ", phone: "" },
    dietaryOrAllergyNotes: " Vegetarian meal, please. ",
    accessibilityNotes: "   ",
    generalNote: " Looking forward to it! "
  };
  draft = updateAdult(draft, "adult-1", (adult) => ({
    ...adult,
    name: " Alex Example ",
    attendance: "attending",
    contact: { email: " ALEX@EXAMPLE.TEST ", phone: "" }
  }));
  return updateAdult(draft, "adult-2", (adult) => ({
    ...adult,
    name: "Sam Example",
    attendance: "not-sure",
    contact: { email: "", phone: "+353 85 123 4567" }
  }));
}

function createCrypto(...keys: string[]): RsvpSubmissionCrypto {
  return {
    subtle: globalThis.crypto.subtle,
    randomUUID: vi.fn(() => keys.shift() ?? SECOND_ATTEMPT_KEY)
  } as RsvpSubmissionCrypto;
}

describe("mapDraftToRsvpSubmission", () => {
  it("strips UI IDs and normalizes both contact layers and optional values", () => {
    const request = mapDraftToRsvpSubmission(createValidDraft());

    expect(request).toEqual({
      guestSide: "niamh",
      adults: [
        {
          name: "Alex Example",
          attendance: "attending",
          contact: { email: "alex@example.test" }
        },
        {
          name: "Sam Example",
          attendance: "not-sure",
          contact: { phone: "+353 85 123 4567" }
        }
      ],
      childrenAttending: 2,
      contact: { email: "party@example.test" },
      dietaryOrAllergyNotes: "Vegetarian meal, please.",
      generalNote: "Looking forward to it!"
    });
    expect(JSON.stringify(request)).not.toContain("adult-1");
  });
});

describe("RSVP request fingerprints", () => {
  it("ignores adult UI IDs and normalized-equivalent whitespace and email casing", async () => {
    const firstDraft = createValidDraft();
    const equivalentDraft = {
      ...firstDraft,
      adults: firstDraft.adults.map((adult, index) => ({
        ...adult,
        id: `replacement-${index}`,
        name: `  ${adult.name.trim()}  `,
        contact: {
          ...adult.contact,
          email: adult.contact.email.toLowerCase()
        }
      })),
      contact: {
        ...firstDraft.contact,
        email: firstDraft.contact.email.toLowerCase()
      }
    };

    await expect(
      createRsvpRequestHash(mapDraftToRsvpSubmission(firstDraft))
    ).resolves.toBe(
      await createRsvpRequestHash(mapDraftToRsvpSubmission(equivalentDraft))
    );
  });

  it.each([
    [
      "name",
      (draft: RsvpDraft) =>
        updateAdult(draft, "adult-1", (adult) => ({
          ...adult,
          name: "Changed Name"
        }))
    ],
    [
      "attendance",
      (draft: RsvpDraft) =>
        updateAdult(draft, "adult-1", (adult) => ({
          ...adult,
          attendance: "unable"
        }))
    ],
    [
      "adult contact",
      (draft: RsvpDraft) =>
        updateAdult(draft, "adult-1", (adult) => ({
          ...adult,
          contact: { email: "changed@example.test", phone: "" }
        }))
    ],
    [
      "party contact",
      (draft: RsvpDraft) => ({
        ...draft,
        contact: { email: "changed-party@example.test", phone: "" }
      })
    ],
    ["children", (draft: RsvpDraft) => ({ ...draft, childrenAttending: 3 })],
    ["notes", (draft: RsvpDraft) => ({ ...draft, generalNote: "Changed note" })]
  ])(
    "changes the fingerprint for meaningful %s changes",
    async (_label, change) => {
      const draft = createValidDraft();
      const originalHash = await createRsvpRequestHash(
        mapDraftToRsvpSubmission(draft)
      );
      const changedHash = await createRsvpRequestHash(
        mapDraftToRsvpSubmission(change(draft))
      );

      expect(changedHash).not.toBe(originalHash);
    }
  );

  it("reuses the key for the same request and creates a new key for a changed request", async () => {
    const webCrypto = createCrypto(
      FIRST_ATTEMPT_KEY,
      SECOND_ATTEMPT_KEY,
      LATER_ATTEMPT_KEY
    );
    const request = mapDraftToRsvpSubmission(createValidDraft());
    const firstAttempt = await resolveUnresolvedRsvpAttempt(
      request,
      null,
      webCrypto
    );
    const replayAttempt = await resolveUnresolvedRsvpAttempt(
      request,
      firstAttempt,
      webCrypto
    );
    const changedRequest = mapDraftToRsvpSubmission({
      ...createValidDraft(),
      generalNote: "A meaningful change"
    });
    const changedAttempt = await resolveUnresolvedRsvpAttempt(
      changedRequest,
      firstAttempt,
      webCrypto
    );
    const laterIntentionalAttempt = await resolveUnresolvedRsvpAttempt(
      request,
      null,
      webCrypto
    );

    expect(firstAttempt.idempotencyKey).toBe(FIRST_ATTEMPT_KEY);
    expect(replayAttempt).toBe(firstAttempt);
    expect(changedAttempt.idempotencyKey).toBe(SECOND_ATTEMPT_KEY);
    expect(laterIntentionalAttempt.idempotencyKey).toBe(LATER_ATTEMPT_KEY);
    expect(webCrypto.randomUUID).toHaveBeenCalledTimes(3);
  });
});
