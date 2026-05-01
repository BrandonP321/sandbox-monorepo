import { describe, expect, it, vi } from "vitest";

import { buildEvidenceRecordFixture } from "../test-fixtures";
import { InMemoryEvidenceAnchorRepository } from "./evidence-anchor-repository";
import { InMemoryEvidenceRepository } from "./evidence-repository";
import {
  createEvidenceAnchorRecord,
  EvidenceItemMissingForAnchorError
} from "./create-evidence-anchor";

describe("createEvidenceAnchorRecord", () => {
  it("creates an anchor for an existing evidence item", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const anchorRepository = new InMemoryEvidenceAnchorRepository();
    await evidenceRepository.create(buildEvidenceRecordFixture());

    await expect(
      createEvidenceAnchorRecord(
        {
          evidenceItemId: "evidence-1",
          quoteText: "A federal court granted an injunction.",
          locator: {}
        },
        {
          repository: anchorRepository,
          evidenceRepository,
          generateId: vi.fn(() => "anchor-1"),
          now: () => new Date("2026-04-25T00:00:00.000Z")
        }
      )
    ).resolves.toEqual({
      id: "anchor-1",
      evidenceItemId: "evidence-1",
      quoteText: "A federal court granted an injunction.",
      locator: {},
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z"
    });

    await expect(anchorRepository.findById("anchor-1")).resolves.toMatchObject({
      evidenceItemId: "evidence-1"
    });
  });

  it("rejects missing evidence item references", async () => {
    await expect(
      createEvidenceAnchorRecord(
        {
          evidenceItemId: "missing-evidence",
          pageLabel: "p. 14",
          locator: {}
        },
        {
          repository: new InMemoryEvidenceAnchorRepository(),
          evidenceRepository: new InMemoryEvidenceRepository()
        }
      )
    ).rejects.toBeInstanceOf(EvidenceItemMissingForAnchorError);
  });
});
