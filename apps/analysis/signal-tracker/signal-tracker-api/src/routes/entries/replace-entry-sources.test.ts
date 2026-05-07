import { describe, expect, it, vi } from "vitest";

import { InMemoryEntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import { InMemoryEntryRepository } from "../../domain/entries/entry-repository";
import { InMemoryEvidenceRepository } from "../../domain/evidence/evidence-repository";
import {
  buildEntryCitationFixture,
  buildEntryFixture
} from "../../domain/test-fixtures";
import { createReplaceEntrySourcesHandler } from "./replace-entry-sources";

describe("replace entry sources route", () => {
  it("replaces managed source URLs for an existing entry", async () => {
    const entryRepository = new InMemoryEntryRepository();
    const evidenceRepository = new InMemoryEvidenceRepository();
    const entryCitationRepository = new InMemoryEntryCitationRepository();
    await entryRepository.create(buildEntryFixture());
    await entryCitationRepository.createOrFind(
      buildEntryCitationFixture({
        id: "old-managed-source",
        relationType: "source_for"
      })
    );
    await entryCitationRepository.createOrFind(
      buildEntryCitationFixture({
        id: "supporting-citation",
        evidenceItemId: "evidence-support",
        relationType: "supports"
      })
    );
    const handler = createReplaceEntrySourcesHandler({
      entryRepository,
      evidenceRepository,
      entryCitationRepository,
      generateId: vi
        .fn(() => "unused")
        .mockReturnValueOnce("source-2")
        .mockReturnValueOnce("evidence-2")
        .mockReturnValueOnce("new-source-citation"),
      now: () => new Date("2026-04-26T01:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/replace-entry-sources",
      body: JSON.stringify({
        entryId: "entry-1",
        sources: [{ url: "https://www.reuters.com/world/updated" }]
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).entry).toMatchObject({
      id: "entry-1",
      updatedAt: "2026-04-26T01:00:00.000Z"
    });
    await expect(
      entryCitationRepository.listByEntry("entry-1")
    ).resolves.toEqual([
      {
        id: "new-source-citation",
        entryId: "entry-1",
        evidenceItemId: "evidence-2",
        relationType: "source_for",
        createdAt: "2026-04-26T01:00:00.000Z"
      },
      buildEntryCitationFixture({
        id: "supporting-citation",
        evidenceItemId: "evidence-support",
        relationType: "supports"
      })
    ]);
  });

  it("clears managed source URLs for assessment entries", async () => {
    const entryRepository = new InMemoryEntryRepository();
    const entryCitationRepository = new InMemoryEntryCitationRepository();
    await entryRepository.create(
      buildEntryFixture({
        id: "assessment-1",
        kind: "assessment",
        epistemicStatus: "forecast"
      })
    );
    await entryCitationRepository.createOrFind(
      buildEntryCitationFixture({
        entryId: "assessment-1",
        id: "old-managed-source",
        relationType: "source_for"
      })
    );
    const handler = createReplaceEntrySourcesHandler({
      entryRepository,
      evidenceRepository: new InMemoryEvidenceRepository(),
      entryCitationRepository,
      now: () => new Date("2026-04-26T01:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/replace-entry-sources",
      body: JSON.stringify({
        entryId: "assessment-1",
        sources: []
      })
    });

    expect(result.statusCode).toBe(200);
    await expect(
      entryCitationRepository.listByEntry("assessment-1")
    ).resolves.toEqual([]);
  });

  it("rejects invalid requests", async () => {
    const handler = createReplaceEntrySourcesHandler({
      entryRepository: new InMemoryEntryRepository(),
      evidenceRepository: new InMemoryEvidenceRepository(),
      entryCitationRepository: new InMemoryEntryCitationRepository()
    });

    for (const body of [
      {},
      { entryId: " " },
      { entryId: "entry-1" },
      { entryId: "entry-1", sources: [{ url: "not a url" }] }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/replace-entry-sources",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }
  });

  it("rejects missing entries", async () => {
    const handler = createReplaceEntrySourcesHandler({
      entryRepository: new InMemoryEntryRepository(),
      evidenceRepository: new InMemoryEvidenceRepository(),
      entryCitationRepository: new InMemoryEntryCitationRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/replace-entry-sources",
        body: JSON.stringify({
          entryId: "missing-entry",
          sources: []
        })
      })
    ).rejects.toMatchObject({
      code: "ENTRY_NOT_FOUND",
      statusCode: 404
    });
  });
});
