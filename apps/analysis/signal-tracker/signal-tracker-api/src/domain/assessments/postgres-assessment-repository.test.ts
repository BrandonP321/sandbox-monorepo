import { describe, expect, it } from "vitest";

import { FakeAssessmentRowStore } from "../repository-test-stores";
import {
  assessmentUpdateToRows,
  buildAssessmentUpdateFixture
} from "../test-fixtures";
import {
  mapAssessmentUpdateRows,
  PostgresAssessmentRepository
} from "./postgres-assessment-repository";

describe("PostgresAssessmentRepository", () => {
  it("maps assessment rows to the shared assessment update shape", () => {
    expect(
      mapAssessmentUpdateRows({
        entry: entryRowFixture,
        assessment: assessmentRowFixture
      })
    ).toEqual(assessmentUpdateFixture);
  });

  it("maps nullable assessment fields to omitted response fields", () => {
    expect(
      mapAssessmentUpdateRows({
        entry: entryRowFixture,
        assessment: {
          ...assessmentRowFixture,
          probabilityPct: null,
          resolutionCriteria: null,
          targetResolvesAt: null,
          previousAssessmentEntryId: null
        }
      })
    ).toEqual({
      ...assessmentUpdateFixture,
      probabilityPct: undefined,
      resolutionCriteria: undefined,
      targetResolvesAt: undefined,
      previousAssessmentEntryId: undefined
    });
  });

  it("persists a valid assessment update through the row store", async () => {
    const store = new FakeAssessmentRowStore();
    const repository = new PostgresAssessmentRepository(store);

    await expect(repository.create(assessmentUpdateFixture)).resolves.toEqual(
      assessmentUpdateFixture
    );
  });

  it("finds the latest active assessment update for a topic", async () => {
    const store = new FakeAssessmentRowStore();
    const repository = new PostgresAssessmentRepository(store);
    store.seed(assessmentUpdateFixture);
    store.seed(
      buildAssessmentUpdateFixture({
        entry: {
          id: "assessment-2",
          title: "Assessment update - 2026-04-26",
          sortAt: "2026-04-26T00:00:00.000Z",
          createdAt: "2026-04-26T01:00:00.000Z",
          updatedAt: "2026-04-26T01:00:00.000Z"
        }
      })
    );
    store.seed(
      buildAssessmentUpdateFixture({
        entry: {
          id: "other-topic-assessment",
          topicId: "topic-2"
        }
      })
    );
    store.seed(
      buildAssessmentUpdateFixture({
        entry: {
          id: "deleted-assessment",
          status: "deleted"
        }
      })
    );

    await expect(
      repository.findLatestActiveByTopic("topic-1")
    ).resolves.toMatchObject({
      entry: {
        id: "assessment-2"
      }
    });
  });

  it("lists active assessment updates for a topic in repository order", async () => {
    const store = new FakeAssessmentRowStore();
    const repository = new PostgresAssessmentRepository(store);
    store.seed(assessmentUpdateFixture);
    store.seed(
      buildAssessmentUpdateFixture({
        entry: {
          id: "assessment-2",
          title: "Assessment update - 2026-04-26",
          sortAt: "2026-04-26T00:00:00.000Z",
          createdAt: "2026-04-26T01:00:00.000Z",
          updatedAt: "2026-04-26T01:00:00.000Z"
        }
      })
    );
    store.seed(
      buildAssessmentUpdateFixture({
        entry: {
          id: "other-topic-assessment",
          topicId: "topic-2"
        }
      })
    );
    store.seed(
      buildAssessmentUpdateFixture({
        entry: {
          id: "archived-assessment",
          status: "archived"
        }
      })
    );

    await expect(repository.listActiveByTopic("topic-1")).resolves.toEqual([
      expect.objectContaining({
        entry: expect.objectContaining({ id: "assessment-2" })
      }),
      assessmentUpdateFixture
    ]);
  });
});

const assessmentUpdateFixture = buildAssessmentUpdateFixture();
const assessmentRowsFixture = assessmentUpdateToRows(assessmentUpdateFixture);
const entryRowFixture = assessmentRowsFixture.entry;
const assessmentRowFixture = assessmentRowsFixture.assessment;
