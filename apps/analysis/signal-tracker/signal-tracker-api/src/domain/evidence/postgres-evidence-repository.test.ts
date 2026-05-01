import { describe, expect, it } from "vitest";

import { FakeEvidenceRowStore } from "../repository-test-stores";
import {
  buildEvidenceItemFixture,
  buildEvidenceRecordFixture,
  buildSourceFixture,
  evidenceRecordToRows
} from "../test-fixtures";
import {
  mapEvidenceRows,
  PostgresEvidenceRepository
} from "./postgres-evidence-repository";

describe("PostgresEvidenceRepository", () => {
  it("maps evidence rows to the shared evidence record shape", () => {
    const record = buildEvidenceRecordFixture();

    expect(mapEvidenceRows(evidenceRecordToRows(record))).toEqual(record);
  });

  it("persists and reads evidence records through the row store", async () => {
    const store = new FakeEvidenceRowStore();
    const writer = new PostgresEvidenceRepository(store);
    const reader = new PostgresEvidenceRepository(store);
    const record = buildEvidenceRecordFixture();

    await expect(writer.create(record)).resolves.toEqual(record);
    await expect(reader.findById(record.evidenceItem.id)).resolves.toEqual(
      record
    );
  });

  it("allows manual evidence without a canonical URL", async () => {
    const repository = new PostgresEvidenceRepository(
      new FakeEvidenceRowStore()
    );
    const record = buildEvidenceRecordFixture({
      source: buildSourceFixture({
        sourceType: "user_uploaded",
        baseUrl: undefined
      }),
      evidenceItem: buildEvidenceItemFixture({
        canonicalUrl: undefined,
        title: "Uploaded court filing"
      })
    });

    await expect(repository.create(record)).resolves.toMatchObject({
      evidenceItem: {
        canonicalUrl: undefined,
        title: "Uploaded court filing"
      }
    });
  });

  it("returns the existing evidence record for duplicate canonical URLs", async () => {
    const store = new FakeEvidenceRowStore();
    const repository = new PostgresEvidenceRepository(store);
    const record = buildEvidenceRecordFixture();
    const duplicateRecord = buildEvidenceRecordFixture({
      source: buildSourceFixture({ id: "source-2" }),
      evidenceItem: buildEvidenceItemFixture({
        id: "evidence-2",
        sourceId: "source-2",
        title: "Duplicate title"
      })
    });

    await repository.create(record);

    await expect(repository.create(duplicateRecord)).resolves.toEqual(record);
    expect(store.count()).toBe(1);
  });

  it("reuses a source by base URL for new evidence", async () => {
    const store = new FakeEvidenceRowStore();
    const repository = new PostgresEvidenceRepository(store);
    const record = buildEvidenceRecordFixture();
    const secondRecord = buildEvidenceRecordFixture({
      source: buildSourceFixture({ id: "source-2" }),
      evidenceItem: buildEvidenceItemFixture({
        id: "evidence-2",
        sourceId: "source-2",
        canonicalUrl: "https://www.reuters.com/world/second",
        title: "Second article"
      })
    });

    await repository.create(record);

    await expect(repository.create(secondRecord)).resolves.toMatchObject({
      source: record.source,
      evidenceItem: {
        id: "evidence-2",
        sourceId: record.source.id
      }
    });
  });
});
