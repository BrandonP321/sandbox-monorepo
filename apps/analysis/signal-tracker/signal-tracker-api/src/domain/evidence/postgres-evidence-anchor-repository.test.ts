import { describe, expect, it } from "vitest";

import { FakeEvidenceAnchorRowStore } from "../repository-test-stores";
import {
  buildEvidenceAnchorFixture,
  evidenceAnchorToRow
} from "../test-fixtures";
import {
  mapEvidenceAnchorRow,
  PostgresEvidenceAnchorRepository
} from "./postgres-evidence-anchor-repository";

describe("PostgresEvidenceAnchorRepository", () => {
  it("maps evidence anchor rows to the shared anchor shape", () => {
    const anchor = buildEvidenceAnchorFixture({
      pageLabel: "p. 14",
      quoteText: undefined,
      prefix: undefined,
      suffix: undefined,
      locator: {
        pageIndex: 13
      }
    });

    expect(mapEvidenceAnchorRow(evidenceAnchorToRow(anchor))).toEqual(anchor);
  });

  it("persists and reads evidence anchors through the row store", async () => {
    const store = new FakeEvidenceAnchorRowStore();
    const writer = new PostgresEvidenceAnchorRepository(store);
    const reader = new PostgresEvidenceAnchorRepository(store);
    const anchor = buildEvidenceAnchorFixture();

    await expect(writer.create(anchor)).resolves.toEqual(anchor);
    await expect(reader.findById(anchor.id)).resolves.toEqual(anchor);
  });

  it("lists evidence item anchors by newest creation time then ID", async () => {
    const store = new FakeEvidenceAnchorRowStore();
    const repository = new PostgresEvidenceAnchorRepository(store);
    const oldestAnchor = buildEvidenceAnchorFixture({
      id: "anchor-1",
      createdAt: "2026-04-25T00:00:00.000Z"
    });
    const newestAnchorA = buildEvidenceAnchorFixture({
      id: "anchor-2",
      pageLabel: "p. 14",
      quoteText: undefined,
      prefix: undefined,
      suffix: undefined,
      createdAt: "2026-04-26T00:00:00.000Z"
    });
    const newestAnchorB = buildEvidenceAnchorFixture({
      id: "anchor-3",
      startPos: 10,
      endPos: 20,
      quoteText: undefined,
      prefix: undefined,
      suffix: undefined,
      createdAt: "2026-04-26T00:00:00.000Z"
    });
    const otherEvidenceAnchor = buildEvidenceAnchorFixture({
      id: "anchor-4",
      evidenceItemId: "evidence-2",
      createdAt: "2026-04-27T00:00:00.000Z"
    });

    for (const anchor of [
      oldestAnchor,
      newestAnchorB,
      otherEvidenceAnchor,
      newestAnchorA
    ]) {
      await repository.create(anchor);
    }

    await expect(
      repository.listByEvidenceItemId("evidence-1")
    ).resolves.toEqual([newestAnchorA, newestAnchorB, oldestAnchor]);
  });
});
