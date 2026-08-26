import {
  createRsvpSubmissionRequestSchema,
  rsvpSchemaVersion,
  serializeCanonicalRsvpRequest,
  type CreateRsvpSubmissionRequest
} from "@repo/wedding-website-shared";

import type { RsvpDraft, UnresolvedRsvpAttemptV1 } from "./rsvpTypes";

type RsvpSubmissionCrypto = Pick<Crypto, "randomUUID" | "subtle">;

function optionalValue(value: string): string | undefined {
  return value.trim() ? value : undefined;
}

function mapDraftToRsvpSubmission(
  draft: RsvpDraft
): CreateRsvpSubmissionRequest {
  return createRsvpSubmissionRequestSchema.parse({
    guestSide: draft.guestSide,
    adults: draft.adults.map((adult) => ({
      name: adult.name,
      attendance: adult.attendance,
      contact: {
        ...(optionalValue(adult.contact.email) === undefined
          ? {}
          : { email: adult.contact.email }),
        ...(optionalValue(adult.contact.phone) === undefined
          ? {}
          : { phone: adult.contact.phone })
      }
    })),
    childrenAttending: draft.childrenAttending,
    contact: {
      ...(optionalValue(draft.contact.email) === undefined
        ? {}
        : { email: draft.contact.email }),
      ...(optionalValue(draft.contact.phone) === undefined
        ? {}
        : { phone: draft.contact.phone })
    },
    ...(optionalValue(draft.dietaryOrAllergyNotes) === undefined
      ? {}
      : { dietaryOrAllergyNotes: draft.dietaryOrAllergyNotes }),
    ...(optionalValue(draft.accessibilityNotes) === undefined
      ? {}
      : { accessibilityNotes: draft.accessibilityNotes }),
    ...(optionalValue(draft.generalNote) === undefined
      ? {}
      : { generalNote: draft.generalNote })
  });
}

function getBrowserCrypto(): RsvpSubmissionCrypto {
  if (
    typeof globalThis.crypto?.randomUUID !== "function" ||
    !globalThis.crypto.subtle
  ) {
    throw new Error("Browser cryptography is unavailable.");
  }

  return globalThis.crypto;
}

async function createRsvpRequestHash(
  request: CreateRsvpSubmissionRequest,
  webCrypto: RsvpSubmissionCrypto = getBrowserCrypto()
): Promise<string> {
  const serializedRequest = serializeCanonicalRsvpRequest(request);
  const digest = await webCrypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(serializedRequest)
  );

  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0")
  ).join("");
}

async function resolveUnresolvedRsvpAttempt(
  request: CreateRsvpSubmissionRequest,
  existingAttempt: UnresolvedRsvpAttemptV1 | null,
  webCrypto: RsvpSubmissionCrypto = getBrowserCrypto()
): Promise<UnresolvedRsvpAttemptV1> {
  const requestHash = await createRsvpRequestHash(request, webCrypto);

  if (
    existingAttempt !== null &&
    existingAttempt.contractVersion === rsvpSchemaVersion &&
    existingAttempt.requestHash === requestHash
  ) {
    return existingAttempt;
  }

  return {
    version: 1,
    contractVersion: rsvpSchemaVersion,
    idempotencyKey: webCrypto.randomUUID(),
    requestHash
  };
}

export {
  createRsvpRequestHash,
  mapDraftToRsvpSubmission,
  resolveUnresolvedRsvpAttempt,
  type RsvpSubmissionCrypto
};
