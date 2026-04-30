import { describe, expect, it } from "vitest";

import { signalTrackerRoutes } from "@repo/signal-tracker-shared";

import { InMemoryAssessmentRepository } from "../domain/assessments/assessment-repository";
import { InMemoryEntryRepository } from "../domain/entries/entry-repository";
import { InMemoryTopicRepository } from "../domain/topics/topic-repository";
import { createAppRouter } from "./router";

describe("createAppRouter", () => {
  it("shares injected dependencies across route handlers", async () => {
    const router = createAppRouter({
      topicRepository: new InMemoryTopicRepository(),
      entryRepository: new InMemoryEntryRepository(),
      assessmentRepository: new InMemoryAssessmentRepository(),
      createId: () => "topic-1",
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    const createResult = await router({
      method: signalTrackerRoutes.createTopic.method,
      path: signalTrackerRoutes.createTopic.path,
      body: JSON.stringify({
        title: "Iran strike risk",
        framingQuestion: "Will tensions escalate?"
      })
    });

    expect(createResult.statusCode).toBe(200);

    const getResult = await router({
      method: signalTrackerRoutes.getTopic.method,
      path: signalTrackerRoutes.getTopic.path,
      body: JSON.stringify({ topicId: "topic-1" })
    });

    expect(getResult.statusCode).toBe(200);
    expect(JSON.parse(getResult.body)).toEqual({
      topic: {
        id: "topic-1",
        title: "Iran strike risk",
        framingQuestion: "Will tensions escalate?",
        status: "active",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z",
        reviewCadence: "ad_hoc"
      },
      currentAssessment: null
    });
  });
});
