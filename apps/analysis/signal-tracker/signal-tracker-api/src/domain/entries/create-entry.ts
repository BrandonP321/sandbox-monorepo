import { randomUUID } from "node:crypto";

import {
  entrySchema,
  type Entry,
  type EntryEpistemicStatus,
  type EntryKind,
  type EntryOriginType
} from "@repo/signal-tracker-shared";

import type { TopicRepository } from "../topics/topic-repository";
import type { EntryRepository } from "./entry-repository";

export type CreateEntryInput = {
  topicId: string;
  kind: EntryKind;
  epistemicStatus: EntryEpistemicStatus;
  title: string;
  bodyMd: string;
  sortAt: string;
  isApproximateDate?: boolean;
  originType?: EntryOriginType;
};

type CreateEntryDependencies = {
  entryRepository: EntryRepository;
  topicRepository: Pick<TopicRepository, "findById">;
  generateId?: () => string;
  now?: () => Date;
};

export class EntryTopicNotFoundError extends Error {
  readonly code = "ENTRY_TOPIC_NOT_FOUND";

  constructor(topicId: string) {
    super(`Topic ${topicId} was not found`);
    this.name = "EntryTopicNotFoundError";
  }
}

export async function createEntryRecord(
  input: CreateEntryInput,
  dependencies: CreateEntryDependencies
): Promise<Entry> {
  const topic = await dependencies.topicRepository.findById(input.topicId);

  if (!topic) {
    throw new EntryTopicNotFoundError(input.topicId);
  }

  const timestamp = (dependencies.now ?? (() => new Date()))().toISOString();
  const entry: Entry = {
    id: (dependencies.generateId ?? randomUUID)(),
    topicId: input.topicId,
    kind: input.kind,
    epistemicStatus: input.epistemicStatus,
    title: input.title,
    bodyMd: input.bodyMd,
    sortAt: input.sortAt,
    isApproximateDate: input.isApproximateDate ?? false,
    originType: input.originType ?? "manual",
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  return await dependencies.entryRepository.create(entrySchema.parse(entry));
}
