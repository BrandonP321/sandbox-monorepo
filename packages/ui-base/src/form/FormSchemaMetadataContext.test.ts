import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createFormSchemaMetadata } from "./FormSchemaMetadataContext";

describe("createFormSchemaMetadata", () => {
  it("collects required field names and inclusive numeric constraints", () => {
    const schema = z.object({
      count: z.number().int(),
      nested: z.object({
        score: z.number().min(1)
      }),
      optionalProbabilityPct: z.number().int().min(0).max(100).optional(),
      probabilityPct: z.number().min(0).max(100),
      ratio: z.number().gt(0).lt(1)
    });

    const metadata = createFormSchemaMetadata(schema);

    expect(metadata.requiredFieldNames.has("probabilityPct")).toBe(true);
    expect(metadata.requiredFieldNames.has("optionalProbabilityPct")).toBe(
      false
    );
    expect(
      metadata.numericFieldConstraintsByName.get("probabilityPct")
    ).toEqual({
      max: 100,
      min: 0
    });
    expect(
      metadata.numericFieldConstraintsByName.get("optionalProbabilityPct")
    ).toEqual({
      max: 100,
      min: 0
    });
    expect(metadata.numericFieldConstraintsByName.get("nested.score")).toEqual({
      min: 1
    });
    expect(metadata.numericFieldConstraintsByName.has("count")).toBe(false);
    expect(metadata.numericFieldConstraintsByName.has("ratio")).toBe(false);
  });
});
