import { describe, expect, it, vi } from "vitest";

import type { AssessmentUpdate, Topic } from "@repo/signal-tracker-shared";

import { InMemoryAssessmentRepository } from "../../domain/assessments/assessment-repository";
import { InMemoryTopicRepository } from "../../domain/topics/topic-repository";
import { createCreateAssessmentUpdateHandler } from "./create-assessment-update";

describe("create assessment update route", () => {
  it("creates an assessment update for an existing topic", async () => {
    const { assessmentRepository, topicRepository } =
      await createRepositories();
    const handler = createCreateAssessmentUpdateHandler({
      assessmentRepository,
      topicRepository,
      generateId: () => "assessment-1",
      now: () => new Date("2026-04-25T01:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/create-assessment-update",
      body: JSON.stringify({
        topicId: " topic-1 ",
        judgment: " Escalation risk remains limited. ",
        confidenceLabel: "medium",
        probabilityPct: 35,
        assumptions: [" Diplomatic channels remain open "],
        indicators: [" Watch for evacuation orders "],
        resolutionCriteria: " Direct military action occurs. ",
        targetResolvesAt: " 2026-05-25T00:00:00.000Z ",
        sortAt: " 2026-04-25T00:00:00.000Z "
      })
    });

    const expectedAssessmentUpdate = {
      entry: {
        id: "assessment-1",
        topicId: "topic-1",
        kind: "assessment",
        epistemicStatus: "forecast",
        title: "Assessment update - 2026-04-25",
        bodyMd: "Escalation risk remains limited.",
        sortAt: "2026-04-25T00:00:00.000Z",
        isApproximateDate: false,
        originType: "manual",
        status: "active",
        createdAt: "2026-04-25T01:00:00.000Z",
        updatedAt: "2026-04-25T01:00:00.000Z"
      },
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium",
      probabilityPct: 35,
      assumptions: ["Diplomatic channels remain open"],
      indicators: ["Watch for evacuation orders"],
      resolutionCriteria: "Direct military action occurs.",
      targetResolvesAt: "2026-05-25T00:00:00.000Z"
    };
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      assessmentUpdate: expectedAssessmentUpdate
    });
    await expect(
      assessmentRepository.findLatestActiveByTopic("topic-1")
    ).resolves.toEqual(expectedAssessmentUpdate);
  });

  it("honors caller titles and auto-links to the latest prior assessment", async () => {
    const { assessmentRepository, topicRepository } =
      await createRepositories();
    let id = 0;
    const handler = createCreateAssessmentUpdateHandler({
      assessmentRepository,
      topicRepository,
      generateId: () => `assessment-${++id}`,
      now: () => new Date("2026-04-25T01:00:00.000Z")
    });

    await handler({
      method: "POST",
      path: "/create-assessment-update",
      body: JSON.stringify(createAssessmentRequestFixture)
    });
    const result = await handler({
      method: "POST",
      path: "/create-assessment-update",
      body: JSON.stringify({
        ...createAssessmentRequestFixture,
        title: "Updated risk assessment",
        sortAt: "2026-04-26T00:00:00.000Z"
      })
    });

    expect(JSON.parse(result.body).assessmentUpdate).toMatchObject({
      entry: {
        id: "assessment-2",
        title: "Updated risk assessment"
      },
      previousAssessmentEntryId: "assessment-1"
    });
  });

  it("rejects invalid assessment update creation requests", async () => {
    const { assessmentRepository, topicRepository } =
      await createRepositories();
    const handler = createCreateAssessmentUpdateHandler({
      assessmentRepository,
      topicRepository
    });

    for (const body of [
      {},
      { ...createAssessmentRequestFixture, judgment: " " },
      { ...createAssessmentRequestFixture, confidenceLabel: "certain" },
      { ...createAssessmentRequestFixture, probabilityPct: 101 },
      { ...createAssessmentRequestFixture, probabilityPct: 35.5 },
      { ...createAssessmentRequestFixture, assumptions: [] },
      { ...createAssessmentRequestFixture, indicators: [" "] }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/create-assessment-update",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }

    await expect(
      handler({
        method: "POST",
        path: "/create-assessment-update",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns not found when creating an assessment for a missing topic", async () => {
    const handler = createCreateAssessmentUpdateHandler({
      assessmentRepository: new InMemoryAssessmentRepository(),
      topicRepository: new InMemoryTopicRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-assessment-update",
        body: JSON.stringify(createAssessmentRequestFixture)
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });
  });

  it("returns persistence unavailable when assessment storage fails", async () => {
    const { topicRepository } = await createRepositories();
    const handler = createCreateAssessmentUpdateHandler({
      assessmentRepository: {
        create: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
        findLatestActiveByTopic: vi.fn(
          async (): Promise<AssessmentUpdate | undefined> => undefined
        )
      },
      topicRepository
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-assessment-update",
        body: JSON.stringify(createAssessmentRequestFixture)
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });
});

async function createRepositories() {
  const assessmentRepository = new InMemoryAssessmentRepository();
  const topicRepository = new InMemoryTopicRepository();
  await topicRepository.create(topicFixture);

  return { assessmentRepository, topicRepository };
}

const createAssessmentRequestFixture = {
  topicId: "topic-1",
  judgment: "Escalation risk remains limited.",
  confidenceLabel: "medium",
  probabilityPct: 35,
  assumptions: ["Diplomatic channels remain open"],
  indicators: ["Watch for evacuation orders"],
  resolutionCriteria: "Direct military action occurs.",
  targetResolvesAt: "2026-05-25T00:00:00.000Z",
  sortAt: "2026-04-25T00:00:00.000Z"
};

const topicFixture: Topic = {
  id: "topic-1",
  title: "Iran strike risk",
  framingQuestion: "Will tensions escalate?",
  scopeNote: "Track military and diplomatic signals.",
  reviewCadence: "weekly",
  status: "active",
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z"
};
