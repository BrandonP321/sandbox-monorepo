import { describe, expect, it, vi } from "vitest";

import type { EvidenceRecord } from "@repo/signal-tracker-shared";

import { InMemoryEvidenceRepository } from "../../domain/evidence/evidence-repository";
import { createCreateEvidenceItemHandler } from "./create-evidence-item";
import { createGetEvidenceItemHandler } from "./get-evidence-item";

describe("evidence routes", () => {
  it("creates manual evidence with a nested source", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const handler = createCreateEvidenceItemHandler({
      evidenceRepository,
      generateId: vi
        .fn(() => "unused")
        .mockReturnValueOnce("source-1")
        .mockReturnValueOnce("evidence-1"),
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/create-evidence-item",
      body: JSON.stringify({
        source: {
          canonicalName: " Reuters ",
          baseUrl: " https://www.reuters.com ",
          sourceType: "news"
        },
        canonicalUrl: " https://www.reuters.com/world/example ",
        title: " Court grants injunction "
      })
    });

    const expectedRecord: EvidenceRecord = {
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
    };

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(expectedRecord);
    await expect(evidenceRepository.findById("evidence-1")).resolves.toEqual(
      expectedRecord
    );
  });

  it("rejects invalid evidence creation requests", async () => {
    const handler = createCreateEvidenceItemHandler({
      evidenceRepository: new InMemoryEvidenceRepository()
    });

    for (const body of [
      {},
      {
        source: {
          canonicalName: "Reuters",
          sourceType: "news"
        },
        title: " "
      },
      {
        source: {
          canonicalName: "Reuters",
          sourceType: "blog"
        },
        title: "Court grants injunction"
      },
      {
        source: {
          canonicalName: "Reuters",
          sourceType: "news"
        },
        canonicalUrl: "not-a-url",
        title: "Court grants injunction"
      }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/create-evidence-item",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }
  });

  it("returns persistence unavailable when evidence creation storage fails", async () => {
    const handler = createCreateEvidenceItemHandler({
      evidenceRepository: {
        create: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
        findById: vi.fn(
          async (): Promise<EvidenceRecord | undefined> => undefined
        )
      }
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-evidence-item",
        body: JSON.stringify({
          source: {
            canonicalName: "Reuters",
            sourceType: "news"
          },
          title: "Court grants injunction"
        })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });

  it("reads an evidence item by ID", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const record: EvidenceRecord = {
      source: {
        id: "source-1",
        canonicalName: "Reuters",
        sourceType: "news",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      },
      evidenceItem: {
        id: "evidence-1",
        sourceId: "source-1",
        title: "Court grants injunction",
        capturedAt: "2026-04-25T00:00:00.000Z",
        metadata: {},
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      }
    };
    await evidenceRepository.create(record);
    const handler = createGetEvidenceItemHandler({ evidenceRepository });

    const result = await handler({
      method: "POST",
      path: "/get-evidence-item",
      body: JSON.stringify({ evidenceItemId: " evidence-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(record);
  });

  it("returns not found when reading missing evidence", async () => {
    const handler = createGetEvidenceItemHandler({
      evidenceRepository: new InMemoryEvidenceRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-evidence-item",
        body: JSON.stringify({ evidenceItemId: "missing-evidence" })
      })
    ).rejects.toMatchObject({
      code: "EVIDENCE_ITEM_NOT_FOUND",
      statusCode: 404
    });
  });
});
