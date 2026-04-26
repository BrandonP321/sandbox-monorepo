import { randomUUID } from "node:crypto";

import {
  topicSchema,
  type CreateTopicRequest,
  type Topic
} from "@repo/signal-tracker-shared";

import type { TopicRepository } from "./topic-repository";

type CreateTopicDependencies = {
  repository: TopicRepository;
  createId?: () => string;
  now?: () => Date;
};

export async function createTopicRecord(
  input: CreateTopicRequest,
  dependencies: CreateTopicDependencies
): Promise<Topic> {
  const timestamp = (dependencies.now ?? (() => new Date()))().toISOString();

  const topic = topicSchema.parse({
    id: (dependencies.createId ?? randomUUID)(),
    title: input.title,
    framingQuestion: input.framingQuestion,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    scopeNote: input.scopeNote,
    reviewCadence: input.reviewCadence
  });

  return dependencies.repository.create(topic);
}
