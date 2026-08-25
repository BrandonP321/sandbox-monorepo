import { describe, expect, it } from "vitest";

import {
  createRsvpSubmissionRequestSchema,
  serializeCanonicalRsvpRequest,
  type CreateRsvpSubmissionRequest
} from "./contracts.js";

function validRequest(): Record<string, unknown> {
  return {
    guestSide: "niamh",
    adults: [
      {
        name: "Example Guest",
        attendance: "attending",
        contact: { email: "guest@example.test" }
      }
    ],
    childrenAttending: 0,
    contact: { phone: "+1 202 555 0148" }
  };
}

function parse(request = validRequest()) {
  return createRsvpSubmissionRequestSchema.parse(request);
}

describe("createRsvpSubmissionRequestSchema", () => {
  it("accepts and normalizes a full two-layer contact request", () => {
    const result = parse({
      ...validRequest(),
      adults: [
        {
          name: "  Example Guest  ",
          attendance: "attending",
          contact: {
            email: "  Guest@Example.TEST ",
            phone: " +353 87 123 4567 "
          }
        }
      ],
      contact: {
        email: " Party@Example.TEST ",
        phone: " 00 352 621 123 456 "
      },
      dietaryOrAllergyNotes: "  Vegetarian  ",
      accessibilityNotes: "   ",
      generalNote: "  Thank you!  "
    });

    expect(result).toEqual({
      guestSide: "niamh",
      adults: [
        {
          name: "Example Guest",
          attendance: "attending",
          contact: {
            email: "guest@example.test",
            phone: "+353 87 123 4567"
          }
        }
      ],
      childrenAttending: 0,
      contact: {
        email: "party@example.test",
        phone: "00 352 621 123 456"
      },
      dietaryOrAllergyNotes: "Vegetarian",
      generalNote: "Thank you!"
    });
  });

  it.each([
    ["adult email", { email: "adult@example.test" }],
    ["adult phone", { phone: "+44 20 7946 0958" }]
  ])("accepts aggregate %s contact", (_label, adultContact) => {
    expect(() =>
      parse({
        ...validRequest(),
        adults: [
          {
            name: "Example Guest",
            attendance: "attending",
            contact: adultContact
          }
        ]
      })
    ).not.toThrow();
  });

  it("allows an individual adult to omit contact when another adult supplies it", () => {
    expect(() =>
      parse({
        ...validRequest(),
        adults: [
          { name: "One", attendance: "attending", contact: {} },
          {
            name: "Two",
            attendance: "not-sure",
            contact: { email: "two@example.test" }
          }
        ]
      })
    ).not.toThrow();
  });

  it("rejects a party with no adult contact anywhere", () => {
    expect(
      createRsvpSubmissionRequestSchema.safeParse({
        ...validRequest(),
        adults: [
          { name: "One", attendance: "attending", contact: {} },
          { name: "Two", attendance: "unable", contact: {} }
        ]
      }).success
    ).toBe(false);
  });

  it.each([
    ["party email", { email: "party@example.test" }],
    ["party phone", { phone: "+1 202 555 0148" }]
  ])("accepts %s independently", (_label, contact) => {
    expect(() => parse({ ...validRequest(), contact })).not.toThrow();
  });

  it("rejects missing party contact independently of adult contact", () => {
    expect(
      createRsvpSubmissionRequestSchema.safeParse({
        ...validRequest(),
        contact: {}
      }).success
    ).toBe(false);
  });

  it.each([
    ["adult email", { email: "invalid" }, "adults"],
    ["adult phone", { phone: "123" }, "adults"],
    ["party email", { email: "invalid" }, "contact"],
    ["party phone", { phone: "123" }, "contact"]
  ])("rejects invalid %s", (_label, contact, layer) => {
    const request = validRequest();
    if (layer === "adults") {
      request.adults = [{ name: "Guest", attendance: "attending", contact }];
    } else {
      request.contact = contact;
    }

    expect(createRsvpSubmissionRequestSchema.safeParse(request).success).toBe(
      false
    );
  });

  it.each([
    [1, true],
    [20, true],
    [0, false],
    [21, false]
  ])("validates an adult count of %i", (count, accepted) => {
    const adults = Array.from({ length: count }, (_, index) => ({
      name: `Guest ${index + 1}`,
      attendance: "attending",
      contact: index === 0 ? { email: "guest@example.test" } : {}
    }));

    expect(
      createRsvpSubmissionRequestSchema.safeParse({
        ...validRequest(),
        adults
      }).success
    ).toBe(accepted);
  });

  it.each([
    [0, true],
    [20, true],
    [-1, false],
    [21, false],
    [1.5, false]
  ])("validates a child count of %s", (childrenAttending, accepted) => {
    expect(
      createRsvpSubmissionRequestSchema.safeParse({
        ...validRequest(),
        childrenAttending
      }).success
    ).toBe(accepted);
  });

  it("counts Unicode code points for name and note limits", () => {
    const emoji = "😀";
    const request = validRequest();
    request.adults = [
      {
        name: emoji.repeat(100),
        attendance: "attending",
        contact: { email: "guest@example.test" }
      }
    ];
    request.generalNote = emoji.repeat(2_000);

    expect(createRsvpSubmissionRequestSchema.safeParse(request).success).toBe(
      true
    );
    (request.adults as Array<Record<string, unknown>>)[0].name =
      emoji.repeat(101);
    expect(createRsvpSubmissionRequestSchema.safeParse(request).success).toBe(
      false
    );
    (request.adults as Array<Record<string, unknown>>)[0].name = "Guest";
    request.generalNote = emoji.repeat(2_001);
    expect(createRsvpSubmissionRequestSchema.safeParse(request).success).toBe(
      false
    );
  });

  it.each(["", "   "])("rejects an empty adult name %j", (name) => {
    const request = validRequest();
    request.adults = [
      {
        name,
        attendance: "attending",
        contact: { email: "guest@example.test" }
      }
    ];

    expect(createRsvpSubmissionRequestSchema.safeParse(request).success).toBe(
      false
    );
  });

  it.each([
    ["request", (request: Record<string, unknown>) => (request.id = "local")],
    [
      "adult",
      (request: Record<string, unknown>) =>
        ((request.adults as Array<Record<string, unknown>>)[0].id = "adult-1")
    ],
    [
      "adult contact",
      (request: Record<string, unknown>) =>
        ((
          (request.adults as Array<Record<string, unknown>>)[0]
            .contact as Record<string, unknown>
        ).unknown = true)
    ],
    [
      "party contact",
      (request: Record<string, unknown>) =>
        ((request.contact as Record<string, unknown>).unknown = true)
    ]
  ])("rejects unknown keys at the %s level", (_label, mutate) => {
    const request = validRequest();
    mutate(request);
    expect(createRsvpSubmissionRequestSchema.safeParse(request).success).toBe(
      false
    );
  });

  it.each(["schemaVersion", "submittedAt", "householdId"])(
    "rejects server or canonical field %s",
    (field) => {
      const request = validRequest();
      request[field] = field === "schemaVersion" ? 1 : "value";
      expect(createRsvpSubmissionRequestSchema.safeParse(request).success).toBe(
        false
      );
    }
  );
});

describe("serializeCanonicalRsvpRequest", () => {
  function canonicalRequest(): CreateRsvpSubmissionRequest {
    return parse({
      ...validRequest(),
      adults: [
        {
          name: "Guest One",
          attendance: "attending",
          contact: { email: "one@example.test", phone: "+1 202 555 0111" }
        },
        {
          name: "Guest Two",
          attendance: "not-sure",
          contact: {}
        }
      ],
      childrenAttending: 2,
      contact: { email: "party@example.test" },
      dietaryOrAllergyNotes: "Vegetarian",
      accessibilityNotes: "Step-free access",
      generalNote: "Hello"
    });
  }

  it("is byte-for-byte deterministic for normalized equivalents", () => {
    const first = parse({
      ...validRequest(),
      adults: [
        {
          name: " Example Guest ",
          attendance: "attending",
          contact: { email: " GUEST@EXAMPLE.TEST " }
        }
      ],
      generalNote: "   "
    });
    const second = parse();

    expect(serializeCanonicalRsvpRequest(first)).toBe(
      serializeCanonicalRsvpRequest(second)
    );
  });

  it.each([
    [
      "guest side",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        guestSide: "brandon" as const
      })
    ],
    [
      "adult name",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        adults: request.adults.map((adult, index) =>
          index === 0 ? { ...adult, name: "Changed" } : adult
        )
      })
    ],
    [
      "adult attendance",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        adults: request.adults.map((adult, index) =>
          index === 0 ? { ...adult, attendance: "unable" as const } : adult
        )
      })
    ],
    [
      "adult contact",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        adults: request.adults.map((adult, index) =>
          index === 0
            ? {
                ...adult,
                contact: { ...adult.contact, phone: "+1 202 555 0199" }
              }
            : adult
        )
      })
    ],
    [
      "adult order",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        adults: [...request.adults].reverse()
      })
    ],
    [
      "children",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        childrenAttending: 3
      })
    ],
    [
      "party contact",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        contact: { phone: "+44 20 7946 0958" }
      })
    ],
    [
      "dietary note",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        dietaryOrAllergyNotes: "Vegan"
      })
    ],
    [
      "accessibility note",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        accessibilityNotes: "Changed"
      })
    ],
    [
      "general note",
      (request: CreateRsvpSubmissionRequest) => ({
        ...request,
        generalNote: "Changed"
      })
    ]
  ])("changes when %s changes", (_label, change) => {
    const request = canonicalRequest();
    expect(serializeCanonicalRsvpRequest(change(request))).not.toBe(
      serializeCanonicalRsvpRequest(request)
    );
  });

  it("cannot include frontend-only IDs", () => {
    const request = canonicalRequest();
    const withId = {
      ...request,
      adults: request.adults.map((adult, index) => ({
        id: `adult-${index + 1}`,
        ...adult
      }))
    };

    expect(createRsvpSubmissionRequestSchema.safeParse(withId).success).toBe(
      false
    );
    expect(serializeCanonicalRsvpRequest(request)).not.toContain("adult-1");
  });
});
