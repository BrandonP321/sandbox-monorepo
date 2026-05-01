import { describe, expect, it, vi } from "vitest";

import type {
  EntryCitation,
  EvidenceRecord
} from "@repo/signal-tracker-shared";

import { InMemoryEntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import { InMemoryEntryRepository } from "../../domain/entries/entry-repository";
import { InMemoryEvidenceAnchorRepository } from "../../domain/evidence/evidence-anchor-repository";
import { InMemoryEvidenceRepository } from "../../domain/evidence/evidence-repository";
import {
  buildEntryCitationFixture,
  buildEntryFixture,
  buildEvidenceAnchorFixture,
  buildEvidenceRecordFixture
} from "../../domain/test-fixtures";
import { createAttachEntryCitationHandler } from "./attach-entry-citation";
import { createDetachEntryCitationHandler } from "./detach-entry-citation";
import { createListEntryCitationsHandler } from "./list-entry-citations";

describe("citation routes", () => {
  it("attaches, lists, and detaches citations for an entry", async () => {
    const dependencies = await buildCitationRouteDependencies();
    const attachHandler = createAttachEntryCitationHandler({
      ...dependencies,
      generateId: vi
        .fn(() => "unused")
        .mockReturnValueOnce("citation-1")
        .mockReturnValueOnce("citation-2")
        .mockReturnValueOnce("citation-duplicate"),
      now: vi
        .fn(() => new Date("2026-04-25T00:00:00.000Z"))
        .mockReturnValueOnce(new Date("2026-04-25T00:00:00.000Z"))
        .mockReturnValueOnce(new Date("2026-04-26T00:00:00.000Z"))
        .mockReturnValueOnce(new Date("2026-04-27T00:00:00.000Z"))
    });
    const listHandler = createListEntryCitationsHandler(dependencies);
    const detachHandler = createDetachEntryCitationHandler(dependencies);

    const itemResult = await attachHandler({
      method: "POST",
      path: "/attach-entry-citation",
      body: JSON.stringify({
        entryId: " entry-1 ",
        evidenceItemId: " evidence-1 ",
        note: " Supports the broad event. "
      })
    });
    const anchorResult = await attachHandler({
      method: "POST",
      path: "/attach-entry-citation",
      body: JSON.stringify({
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        evidenceAnchorId: "anchor-1",
        relationType: "source_for"
      })
    });
    const duplicateItemResult = await attachHandler({
      method: "POST",
      path: "/attach-entry-citation",
      body: JSON.stringify({
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        note: "Replacement note."
      })
    });

    expect(itemResult.statusCode).toBe(200);
    expect(JSON.parse(itemResult.body)).toEqual({
      citation: {
        citation: {
          id: "citation-1",
          entryId: "entry-1",
          evidenceItemId: "evidence-1",
          relationType: "supports",
          note: "Supports the broad event.",
          createdAt: "2026-04-25T00:00:00.000Z"
        },
        evidence: dependencies.evidenceRecord,
        anchor: null
      }
    });
    expect(anchorResult.statusCode).toBe(200);
    expect(JSON.parse(anchorResult.body).citation).toEqual({
      citation: {
        id: "citation-2",
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        evidenceAnchorId: "anchor-1",
        relationType: "source_for",
        createdAt: "2026-04-26T00:00:00.000Z"
      },
      evidence: dependencies.evidenceRecord,
      anchor: dependencies.anchor
    });
    expect(JSON.parse(duplicateItemResult.body)).toEqual(
      JSON.parse(itemResult.body)
    );
    expect(dependencies.entryCitationRepository.count()).toBe(2);

    const listResult = await listHandler({
      method: "POST",
      path: "/list-entry-citations",
      body: JSON.stringify({ entryId: "entry-1" })
    });

    expect(listResult.statusCode).toBe(200);
    expect(JSON.parse(listResult.body)).toEqual({
      citations: [
        JSON.parse(anchorResult.body).citation,
        JSON.parse(itemResult.body).citation
      ]
    });

    const detachResult = await detachHandler({
      method: "POST",
      path: "/detach-entry-citation",
      body: JSON.stringify({
        entryId: "entry-1",
        citationId: "citation-1"
      })
    });

    expect(detachResult.statusCode).toBe(200);
    expect(JSON.parse(detachResult.body)).toEqual(JSON.parse(itemResult.body));
    await expect(
      dependencies.entryCitationRepository.findById("citation-1")
    ).resolves.toBeUndefined();
  });

  it("returns not found for invalid entry, evidence, anchor, and citation references", async () => {
    const dependencies = await buildCitationRouteDependencies();
    const attachHandler = createAttachEntryCitationHandler(dependencies);
    const detachHandler = createDetachEntryCitationHandler(dependencies);
    const listHandler = createListEntryCitationsHandler(dependencies);

    await expect(
      attachHandler({
        method: "POST",
        path: "/attach-entry-citation",
        body: JSON.stringify({
          entryId: "missing-entry",
          evidenceItemId: "evidence-1"
        })
      })
    ).rejects.toMatchObject({
      code: "ENTRY_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      attachHandler({
        method: "POST",
        path: "/attach-entry-citation",
        body: JSON.stringify({
          entryId: "entry-1",
          evidenceItemId: "missing-evidence"
        })
      })
    ).rejects.toMatchObject({
      code: "EVIDENCE_ITEM_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      attachHandler({
        method: "POST",
        path: "/attach-entry-citation",
        body: JSON.stringify({
          entryId: "entry-1",
          evidenceItemId: "evidence-1",
          evidenceAnchorId: "missing-anchor"
        })
      })
    ).rejects.toMatchObject({
      code: "EVIDENCE_ANCHOR_NOT_FOUND",
      statusCode: 404
    });

    await dependencies.evidenceAnchorRepository.create(
      buildEvidenceAnchorFixture({
        id: "other-anchor",
        evidenceItemId: "other-evidence"
      })
    );
    await expect(
      attachHandler({
        method: "POST",
        path: "/attach-entry-citation",
        body: JSON.stringify({
          entryId: "entry-1",
          evidenceItemId: "evidence-1",
          evidenceAnchorId: "other-anchor"
        })
      })
    ).rejects.toMatchObject({
      code: "EVIDENCE_ANCHOR_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      detachHandler({
        method: "POST",
        path: "/detach-entry-citation",
        body: JSON.stringify({
          entryId: "entry-1",
          citationId: "missing-citation"
        })
      })
    ).rejects.toMatchObject({
      code: "ENTRY_CITATION_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      listHandler({
        method: "POST",
        path: "/list-entry-citations",
        body: JSON.stringify({ entryId: "missing-entry" })
      })
    ).rejects.toMatchObject({
      code: "ENTRY_NOT_FOUND",
      statusCode: 404
    });
  });

  it("rejects invalid attach, detach, and list requests", async () => {
    const dependencies = await buildCitationRouteDependencies();
    const attachHandler = createAttachEntryCitationHandler(dependencies);
    const detachHandler = createDetachEntryCitationHandler(dependencies);
    const listHandler = createListEntryCitationsHandler(dependencies);

    for (const [handler, body] of [
      [attachHandler, { entryId: "entry-1", evidenceItemId: " " }],
      [
        attachHandler,
        {
          entryId: "entry-1",
          evidenceItemId: "evidence-1",
          relationType: "proves"
        }
      ],
      [detachHandler, { entryId: "entry-1" }],
      [listHandler, { entryId: " " }]
    ] as const) {
      await expect(
        handler({
          method: "POST",
          path: "/citation-test",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }
  });

  it("returns persistence unavailable when citation storage fails", async () => {
    const dependencies = await buildCitationRouteDependencies();
    const handler = createAttachEntryCitationHandler({
      ...dependencies,
      entryCitationRepository: {
        createOrFind: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
        findById: vi.fn(
          async (): Promise<EntryCitation | undefined> => undefined
        ),
        listByEntry: vi.fn(async () => []),
        deleteForEntry: vi.fn(
          async (): Promise<EntryCitation | undefined> => undefined
        )
      }
    });

    await expect(
      handler({
        method: "POST",
        path: "/attach-entry-citation",
        body: JSON.stringify({
          entryId: "entry-1",
          evidenceItemId: "evidence-1"
        })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });
});

async function buildCitationRouteDependencies() {
  const entryRepository = new InMemoryEntryRepository();
  const evidenceRepository = new InMemoryEvidenceRepository();
  const evidenceAnchorRepository = new InMemoryEvidenceAnchorRepository();
  const entryCitationRepository = new InMemoryEntryCitationRepository();
  const entry = buildEntryFixture();
  const evidenceRecord: EvidenceRecord = buildEvidenceRecordFixture({
    source: {
      ...buildEvidenceRecordFixture().source,
      notes: undefined,
      baseUrl: undefined
    },
    evidenceItem: {
      ...buildEvidenceRecordFixture().evidenceItem,
      canonicalUrl: undefined,
      author: undefined,
      publishedAt: undefined,
      contentType: undefined,
      language: undefined,
      snapshotHash: undefined,
      storageKey: undefined,
      metadata: {}
    }
  });
  const anchor = buildEvidenceAnchorFixture({
    prefix: undefined,
    suffix: undefined
  });

  await entryRepository.create(entry);
  await evidenceRepository.create(evidenceRecord);
  await evidenceAnchorRepository.create(anchor);
  await entryCitationRepository.createOrFind(
    buildEntryCitationFixture({
      id: "other-entry-citation",
      entryId: "entry-2"
    })
  );
  await entryCitationRepository.deleteForEntry(
    "entry-2",
    "other-entry-citation"
  );

  return {
    entryRepository,
    evidenceRepository,
    evidenceAnchorRepository,
    entryCitationRepository,
    evidenceRecord,
    anchor
  };
}
