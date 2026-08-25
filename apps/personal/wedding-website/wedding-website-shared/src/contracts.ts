import { z } from "zod";
import {
  createOptionalTrimmedString,
  createTrimmedRequiredString
} from "@repo/schema-utils";

export const rsvpSchemaVersion = 1 as const;

const unicodeLength = (value: string) => Array.from(value).length;

const adultNameSchema = createTrimmedRequiredString().refine(
  (value) => unicodeLength(value) <= 100,
  "Name must contain no more than 100 characters."
);

const emailSchema = z.string().trim().toLowerCase().max(254).email();

const phoneSchema = z
  .string()
  .trim()
  .max(32)
  .refine((value) => {
    const digitCount = value.replace(/\D/g, "").length;
    return digitCount >= 7 && digitCount <= 15;
  }, "Phone must contain 7 to 15 digits.");

const contactSchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional()
  })
  .strict();

const partyContactSchema = contactSchema.refine(
  (contact) => contact.email !== undefined || contact.phone !== undefined,
  "At least one party email or phone is required."
);

const noteSchema = createOptionalTrimmedString()
  .refine(
    (value) => value === undefined || unicodeLength(value) <= 2_000,
    "Note must contain no more than 2,000 characters."
  )
  .optional();

const adultSchema = z
  .object({
    name: adultNameSchema,
    attendance: z.enum(["attending", "not-sure", "unable"]),
    contact: contactSchema
  })
  .strict();

export const createRsvpSubmissionRequestSchema = z
  .object({
    guestSide: z.enum(["niamh", "brandon"]),
    adults: z.array(adultSchema).min(1).max(20),
    childrenAttending: z.number().int().min(0).max(20),
    contact: partyContactSchema,
    dietaryOrAllergyNotes: noteSchema,
    accessibilityNotes: noteSchema,
    generalNote: noteSchema
  })
  .strict()
  .refine(
    (request) =>
      request.adults.some(
        (adult) =>
          adult.contact.email !== undefined || adult.contact.phone !== undefined
      ),
    {
      path: ["adults"],
      message: "At least one adult email or phone is required."
    }
  );

export type CreateRsvpSubmissionRequest = z.infer<
  typeof createRsvpSubmissionRequestSchema
>;

export const createRsvpSubmissionResponseSchema = z
  .object({
    submissionId: z.uuidv4(),
    submittedAt: z.iso.datetime({ offset: false }),
    schemaVersion: z.literal(rsvpSchemaVersion)
  })
  .strict();

export type CreateRsvpSubmissionResponse = z.infer<
  typeof createRsvpSubmissionResponseSchema
>;

function canonicalContact(contact: { email?: string; phone?: string }): {
  email?: string;
  phone?: string;
} {
  return {
    ...(contact.email === undefined ? {} : { email: contact.email }),
    ...(contact.phone === undefined ? {} : { phone: contact.phone })
  };
}

export function serializeCanonicalRsvpRequest(
  request: CreateRsvpSubmissionRequest
): string {
  return JSON.stringify({
    guestSide: request.guestSide,
    adults: request.adults.map((adult) => ({
      name: adult.name,
      attendance: adult.attendance,
      contact: canonicalContact(adult.contact)
    })),
    childrenAttending: request.childrenAttending,
    contact: canonicalContact(request.contact),
    ...(request.dietaryOrAllergyNotes === undefined
      ? {}
      : { dietaryOrAllergyNotes: request.dietaryOrAllergyNotes }),
    ...(request.accessibilityNotes === undefined
      ? {}
      : { accessibilityNotes: request.accessibilityNotes }),
    ...(request.generalNote === undefined
      ? {}
      : { generalNote: request.generalNote })
  });
}
