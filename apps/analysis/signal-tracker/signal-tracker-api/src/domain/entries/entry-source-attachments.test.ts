import { describe, expect, it, vi } from "vitest";

import { InMemoryEntryCitationRepository } from "../citations/entry-citation-repository";
import { InMemoryEvidenceRepository } from "../evidence/evidence-repository";
import {
  buildEntryCitationFixture,
  buildEvidenceAnchorFixture,
  buildEvidenceRecordFixture
} from "../test-fixtures";
import { replaceEntrySourceAttachments } from "./entry-source-attachments";

describe("replaceEntrySourceAttachments", () => {
  it("attaches unique canonical source URLs as source_for citations", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const entryCitationRepository = new InMemoryEntryCitationRepository();
    const generateId = vi
      .fn(() => "unused")
      .mockReturnValueOnce("source-1")
      .mockReturnValueOnce("evidence-1")
      .mockReturnValueOnce("citation-1");

    await replaceEntrySourceAttachments(
      "entry-1",
      [
        {
          url: "https://www.reuters.com/world/example?utm_source=newsletter&b=2&a=1"
        },
        { url: "https://www.reuters.com/world/example?a=1&b=2#ignored" }
      ],
      {
        evidenceRepository,
        entryCitationRepository,
        generateId,
        now: () => new Date("2026-04-25T00:00:00.000Z")
      }
    );

    await expect(
      entryCitationRepository.listByEntry("entry-1")
    ).resolves.toEqual([
      {
        id: "citation-1",
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        relationType: "source_for",
        createdAt: "2026-04-25T00:00:00.000Z"
      }
    ]);
    await expect(
      evidenceRepository.findById("evidence-1")
    ).resolves.toMatchObject({
      evidenceItem: {
        canonicalUrl: "https://www.reuters.com/world/example?a=1&b=2"
      }
    });
    expect(generateId).toHaveBeenCalledTimes(3);
  });

  it("replaces only unanchored source_for citations", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const entryCitationRepository = new InMemoryEntryCitationRepository();
    await evidenceRepository.create(buildEvidenceRecordFixture());
    await entryCitationRepository.createOrFind(
      buildEntryCitationFixture({
        id: "managed-source",
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
    await entryCitationRepository.createOrFind(
      buildEntryCitationFixture({
        id: "anchored-source",
        evidenceAnchorId: buildEvidenceAnchorFixture().id,
        relationType: "source_for"
      })
    );

    await replaceEntrySourceAttachments("entry-1", [], {
      evidenceRepository,
      entryCitationRepository
    });

    await expect(
      entryCitationRepository.listByEntry("entry-1")
    ).resolves.toEqual([
      buildEntryCitationFixture({
        id: "anchored-source",
        evidenceAnchorId: "anchor-1",
        relationType: "source_for"
      }),
      buildEntryCitationFixture({
        id: "supporting-citation",
        evidenceItemId: "evidence-support",
        relationType: "supports"
      })
    ]);
  });

  it("reuses existing evidence records by canonical URL", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const entryCitationRepository = new InMemoryEntryCitationRepository();
    await evidenceRepository.create(
      buildEvidenceRecordFixture({
        evidenceItem: {
          ...buildEvidenceRecordFixture().evidenceItem,
          canonicalUrl: "https://www.reuters.com/world/example?a=1&b=2"
        }
      })
    );

    await replaceEntrySourceAttachments(
      "entry-1",
      [{ url: "https://www.reuters.com/world/example?b=2&a=1" }],
      {
        evidenceRepository,
        entryCitationRepository,
        generateId: vi
          .fn(() => "unused")
          .mockReturnValueOnce("source-2")
          .mockReturnValueOnce("evidence-2")
          .mockReturnValueOnce("citation-1"),
        now: () => new Date("2026-04-25T00:00:00.000Z")
      }
    );

    await expect(
      evidenceRepository.findById("evidence-2")
    ).resolves.toBeUndefined();
    await expect(
      entryCitationRepository.listByEntry("entry-1")
    ).resolves.toEqual([
      {
        id: "citation-1",
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        relationType: "source_for",
        createdAt: "2026-04-25T00:00:00.000Z"
      }
    ]);
  });
});
