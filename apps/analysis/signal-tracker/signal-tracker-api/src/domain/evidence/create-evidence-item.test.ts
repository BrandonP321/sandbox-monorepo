import { describe, expect, it, vi } from "vitest";

import { createEvidenceItemRecord } from "./create-evidence-item";
import { InMemoryEvidenceRepository } from "./evidence-repository";

describe("createEvidenceItemRecord", () => {
  it("creates manual evidence with nested source fields", async () => {
    const repository = new InMemoryEvidenceRepository();
    const generateId = vi
      .fn(() => "unused")
      .mockReturnValueOnce("source-1")
      .mockReturnValueOnce("evidence-1");

    await expect(
      createEvidenceItemRecord(
        {
          source: {
            canonicalName: "Reuters",
            baseUrl: "https://www.reuters.com",
            sourceType: "news"
          },
          canonicalUrl: "https://www.reuters.com/world/example",
          title: "Court grants injunction"
        },
        {
          repository,
          generateId,
          now: () => new Date("2026-04-25T00:00:00.000Z")
        }
      )
    ).resolves.toEqual({
      source: {
        id: "source-1",
        canonicalName: "Reuters",
        baseUrl: "https://www.reuters.com",
        sourceType: "news",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      },
      evidenceItem: {
        id: "evidence-1",
        sourceId: "source-1",
        canonicalUrl: "https://www.reuters.com/world/example",
        title: "Court grants injunction",
        capturedAt: "2026-04-25T00:00:00.000Z",
        metadata: {},
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      }
    });
  });

  it("supports manual evidence without a canonical URL", async () => {
    const repository = new InMemoryEvidenceRepository();
    const generateId = vi
      .fn(() => "unused")
      .mockReturnValueOnce("source-1")
      .mockReturnValueOnce("evidence-1");

    const record = await createEvidenceItemRecord(
      {
        source: {
          canonicalName: "User uploaded document",
          sourceType: "user_uploaded"
        },
        title: "Uploaded court filing",
        capturedAt: "2026-04-24T00:00:00.000Z",
        metadata: { originalFilename: "filing.pdf" }
      },
      {
        repository,
        generateId,
        now: () => new Date("2026-04-25T00:00:00.000Z")
      }
    );

    expect(record.evidenceItem).toMatchObject({
      id: "evidence-1",
      canonicalUrl: undefined,
      title: "Uploaded court filing",
      capturedAt: "2026-04-24T00:00:00.000Z",
      metadata: { originalFilename: "filing.pdf" }
    });
  });

  it("returns the existing evidence item for duplicate canonical URLs", async () => {
    const repository = new InMemoryEvidenceRepository();

    const firstRecord = await createEvidenceItemRecord(
      {
        source: {
          canonicalName: "Reuters",
          sourceType: "news"
        },
        canonicalUrl: "https://www.reuters.com/world/example",
        title: "Original title"
      },
      {
        repository,
        generateId: vi
          .fn(() => "unused")
          .mockReturnValueOnce("source-1")
          .mockReturnValueOnce("evidence-1"),
        now: () => new Date("2026-04-25T00:00:00.000Z")
      }
    );
    const duplicateRecord = await createEvidenceItemRecord(
      {
        source: {
          canonicalName: "Reuters",
          sourceType: "news"
        },
        canonicalUrl: "https://www.reuters.com/world/example",
        title: "Duplicate title"
      },
      {
        repository,
        generateId: vi
          .fn(() => "unused")
          .mockReturnValueOnce("source-2")
          .mockReturnValueOnce("evidence-2"),
        now: () => new Date("2026-04-26T00:00:00.000Z")
      }
    );

    expect(duplicateRecord).toEqual(firstRecord);
    await expect(repository.findById("evidence-2")).resolves.toBeUndefined();
  });
});
