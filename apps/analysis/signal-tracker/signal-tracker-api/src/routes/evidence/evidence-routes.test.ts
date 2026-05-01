import { describe, expect, it, vi } from "vitest";

import type { EvidenceRecord } from "@repo/signal-tracker-shared";

import { InMemoryEvidenceAnchorRepository } from "../../domain/evidence/evidence-anchor-repository";
import { InMemoryEvidenceRepository } from "../../domain/evidence/evidence-repository";
import { createCreateEvidenceAnchorHandler } from "./create-evidence-anchor";
import { createCaptureEvidenceUrlHandler } from "./capture-evidence-url";
import { createCreateEvidenceItemHandler } from "./create-evidence-item";
import { createGetEvidenceAnchorHandler } from "./get-evidence-anchor";
import { createGetEvidenceItemHandler } from "./get-evidence-item";
import { createListEvidenceAnchorsForItemHandler } from "./list-evidence-anchors-for-item";
import { createListEvidenceItemsHandler } from "./list-evidence-items";

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
        ),
        list: vi.fn(async () => [])
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

  it("captures evidence from a pasted URL", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const handler = createCaptureEvidenceUrlHandler({
      evidenceRepository,
      generateId: vi
        .fn(() => "unused")
        .mockReturnValueOnce("source-1")
        .mockReturnValueOnce("evidence-1"),
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/capture-evidence-url",
      body: JSON.stringify({
        url: " https://www.reuters.com/world/example?utm_source=newsletter&b=2&a=1#section ",
        source: {
          canonicalName: " Reuters ",
          sourceType: "news"
        },
        title: " Court grants injunction "
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
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
        canonicalUrl: "https://www.reuters.com/world/example?a=1&b=2",
        title: "Court grants injunction",
        capturedAt: "2026-04-25T00:00:00.000Z",
        metadata: {
          originalUrl:
            "https://www.reuters.com/world/example?utm_source=newsletter&b=2&a=1#section",
          captureMethod: "url_paste"
        },
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      }
    });
  });

  it("rejects invalid URL capture requests", async () => {
    const handler = createCaptureEvidenceUrlHandler({
      evidenceRepository: new InMemoryEvidenceRepository()
    });

    for (const body of [
      {},
      { url: "not-a-url" },
      { url: "ftp://example.com/file" },
      {
        url: "https://www.reuters.com/world/example",
        source: { sourceType: "blog" }
      }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/capture-evidence-url",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }
  });

  it("returns persistence unavailable when URL capture storage fails", async () => {
    const handler = createCaptureEvidenceUrlHandler({
      evidenceRepository: {
        create: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
        findById: vi.fn(
          async (): Promise<EvidenceRecord | undefined> => undefined
        ),
        list: vi.fn(async () => [])
      }
    });

    await expect(
      handler({
        method: "POST",
        path: "/capture-evidence-url",
        body: JSON.stringify({
          url: "https://www.reuters.com/world/example"
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

  it("lists evidence items with newest captures first and query filtering", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const olderRecord: EvidenceRecord = {
      source: {
        id: "source-1",
        canonicalName: "Reuters",
        baseUrl: "https://www.reuters.com",
        sourceType: "news",
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z"
      },
      evidenceItem: {
        id: "evidence-1",
        sourceId: "source-1",
        canonicalUrl: "https://www.reuters.com/world/example",
        title: "Court grants injunction",
        capturedAt: "2026-04-24T00:00:00.000Z",
        metadata: {},
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z"
      }
    };
    const newerRecord: EvidenceRecord = {
      source: {
        id: "source-2",
        canonicalName: "Federal Register",
        baseUrl: "https://www.federalregister.gov",
        sourceType: "government",
        createdAt: "2026-04-26T00:00:00.000Z",
        updatedAt: "2026-04-26T00:00:00.000Z"
      },
      evidenceItem: {
        id: "evidence-2",
        sourceId: "source-2",
        canonicalUrl: "https://www.federalregister.gov/documents/example",
        title: "Agency releases proposed rule",
        capturedAt: "2026-04-26T00:00:00.000Z",
        metadata: {},
        createdAt: "2026-04-26T00:00:00.000Z",
        updatedAt: "2026-04-26T00:00:00.000Z"
      }
    };
    await evidenceRepository.create(olderRecord);
    await evidenceRepository.create(newerRecord);
    const handler = createListEvidenceItemsHandler({ evidenceRepository });

    const listResult = await handler({
      method: "POST",
      path: "/list-evidence-items",
      body: JSON.stringify({})
    });
    const queryResult = await handler({
      method: "POST",
      path: "/list-evidence-items",
      body: JSON.stringify({ query: " reuters " })
    });

    expect(listResult.statusCode).toBe(200);
    expect(JSON.parse(listResult.body)).toEqual({
      evidence: [newerRecord, olderRecord]
    });
    expect(JSON.parse(queryResult.body)).toEqual({
      evidence: [olderRecord]
    });
  });

  it("returns persistence unavailable when evidence list storage fails", async () => {
    const handler = createListEvidenceItemsHandler({
      evidenceRepository: {
        list: vi.fn(async () => {
          throw new Error("database unavailable");
        })
      }
    });

    await expect(
      handler({
        method: "POST",
        path: "/list-evidence-items",
        body: JSON.stringify({})
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });

  it("creates an evidence anchor for an existing evidence item", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const evidenceAnchorRepository = new InMemoryEvidenceAnchorRepository();
    await evidenceRepository.create({
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
    });
    const handler = createCreateEvidenceAnchorHandler({
      evidenceRepository,
      evidenceAnchorRepository,
      generateId: vi.fn(() => "anchor-1"),
      now: () => new Date("2026-04-26T00:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/create-evidence-anchor",
      body: JSON.stringify({
        evidenceItemId: " evidence-1 ",
        quoteText: " A federal court granted an injunction. ",
        prefix: " Context before. ",
        suffix: " Context after. "
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      anchor: {
        id: "anchor-1",
        evidenceItemId: "evidence-1",
        quoteText: "A federal court granted an injunction.",
        prefix: "Context before.",
        suffix: "Context after.",
        locator: {},
        createdAt: "2026-04-26T00:00:00.000Z",
        updatedAt: "2026-04-26T00:00:00.000Z"
      }
    });
    await expect(
      evidenceAnchorRepository.findById("anchor-1")
    ).resolves.toEqual(JSON.parse(result.body).anchor);
  });

  it("returns evidence item not found when creating an anchor for missing evidence", async () => {
    const handler = createCreateEvidenceAnchorHandler({
      evidenceRepository: new InMemoryEvidenceRepository(),
      evidenceAnchorRepository: new InMemoryEvidenceAnchorRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-evidence-anchor",
        body: JSON.stringify({
          evidenceItemId: "missing-evidence",
          pageLabel: "p. 14"
        })
      })
    ).rejects.toMatchObject({
      code: "EVIDENCE_ITEM_NOT_FOUND",
      statusCode: 404
    });
  });

  it("rejects invalid evidence anchor creation requests", async () => {
    const handler = createCreateEvidenceAnchorHandler({
      evidenceRepository: new InMemoryEvidenceRepository(),
      evidenceAnchorRepository: new InMemoryEvidenceAnchorRepository()
    });

    for (const body of [
      {},
      { evidenceItemId: "evidence-1" },
      {
        evidenceItemId: "evidence-1",
        prefix: "Context only"
      },
      {
        evidenceItemId: "evidence-1",
        startPos: 10
      },
      {
        evidenceItemId: "evidence-1",
        startPos: 20,
        endPos: 10
      }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/create-evidence-anchor",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }
  });

  it("returns persistence unavailable when evidence anchor storage fails", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    await evidenceRepository.create({
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
    });
    const handler = createCreateEvidenceAnchorHandler({
      evidenceRepository,
      evidenceAnchorRepository: {
        create: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
        findById: vi.fn(async () => undefined),
        listByEvidenceItemId: vi.fn(async () => [])
      }
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-evidence-anchor",
        body: JSON.stringify({
          evidenceItemId: "evidence-1",
          quoteText: "A federal court granted an injunction."
        })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });

  it("reads and lists evidence anchors", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const evidenceAnchorRepository = new InMemoryEvidenceAnchorRepository();
    await evidenceRepository.create({
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
    });
    await evidenceAnchorRepository.create({
      id: "anchor-1",
      evidenceItemId: "evidence-1",
      quoteText: "Older quote",
      locator: {},
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z"
    });
    await evidenceAnchorRepository.create({
      id: "anchor-2",
      evidenceItemId: "evidence-1",
      pageLabel: "p. 14",
      locator: {},
      createdAt: "2026-04-26T00:00:00.000Z",
      updatedAt: "2026-04-26T00:00:00.000Z"
    });
    const getHandler = createGetEvidenceAnchorHandler({
      evidenceAnchorRepository
    });
    const listHandler = createListEvidenceAnchorsForItemHandler({
      evidenceRepository,
      evidenceAnchorRepository
    });

    const getResult = await getHandler({
      method: "POST",
      path: "/get-evidence-anchor",
      body: JSON.stringify({ anchorId: " anchor-2 " })
    });
    const listResult = await listHandler({
      method: "POST",
      path: "/list-evidence-anchors-for-item",
      body: JSON.stringify({ evidenceItemId: " evidence-1 " })
    });

    expect(getResult.statusCode).toBe(200);
    expect(JSON.parse(getResult.body)).toEqual({
      anchor: {
        id: "anchor-2",
        evidenceItemId: "evidence-1",
        pageLabel: "p. 14",
        locator: {},
        createdAt: "2026-04-26T00:00:00.000Z",
        updatedAt: "2026-04-26T00:00:00.000Z"
      }
    });
    expect(listResult.statusCode).toBe(200);
    expect(JSON.parse(listResult.body)).toEqual({
      anchors: [
        JSON.parse(getResult.body).anchor,
        {
          id: "anchor-1",
          evidenceItemId: "evidence-1",
          quoteText: "Older quote",
          locator: {},
          createdAt: "2026-04-25T00:00:00.000Z",
          updatedAt: "2026-04-25T00:00:00.000Z"
        }
      ]
    });
  });

  it("returns not found for missing evidence anchors and missing evidence on list", async () => {
    const getHandler = createGetEvidenceAnchorHandler({
      evidenceAnchorRepository: new InMemoryEvidenceAnchorRepository()
    });
    const listHandler = createListEvidenceAnchorsForItemHandler({
      evidenceRepository: new InMemoryEvidenceRepository(),
      evidenceAnchorRepository: new InMemoryEvidenceAnchorRepository()
    });

    await expect(
      getHandler({
        method: "POST",
        path: "/get-evidence-anchor",
        body: JSON.stringify({ anchorId: "missing-anchor" })
      })
    ).rejects.toMatchObject({
      code: "EVIDENCE_ANCHOR_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      listHandler({
        method: "POST",
        path: "/list-evidence-anchors-for-item",
        body: JSON.stringify({ evidenceItemId: "missing-evidence" })
      })
    ).rejects.toMatchObject({
      code: "EVIDENCE_ITEM_NOT_FOUND",
      statusCode: 404
    });
  });
});
