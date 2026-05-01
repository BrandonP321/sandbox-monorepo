import {
  signalTrackerRouteContracts,
  type AssessmentUpdate,
  type Entry,
  type TopicTimelineItem
} from "@repo/signal-tracker-shared";
import type { RouteHandler } from "@repo/api-core";

import {
  createJsonRouteHandler,
  withPersistenceErrorMapping
} from "../../app/route-helpers";
import type { AssessmentRepository } from "../../domain/assessments/assessment-repository";
import type { EntryRepository } from "../../domain/entries/entry-repository";

type ListTopicTimelineHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "listByTopic">;
  assessmentRepository: Pick<AssessmentRepository, "listActiveByTopic">;
};

export function createListTopicTimelineHandler(
  dependencies: ListTopicTimelineHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.listTopicTimeline,
    handle: async (request) => {
      const items = await listActiveTopicTimelineItems(
        request.topicId,
        dependencies
      );

      return {
        items:
          request.limit === undefined ? items : items.slice(0, request.limit)
      };
    }
  });
}

async function listActiveTopicTimelineItems(
  topicId: string,
  dependencies: ListTopicTimelineHandlerDependencies
): Promise<TopicTimelineItem[]> {
  return withPersistenceErrorMapping(async () => {
    const [entries, assessmentUpdates] = await Promise.all([
      dependencies.entryRepository.listByTopic(topicId),
      dependencies.assessmentRepository.listActiveByTopic(topicId)
    ]);

    return [
      ...entries.flatMap(entryToTimelineItem),
      ...assessmentUpdates.map(assessmentUpdateToTimelineItem)
    ].sort(compareTimelineItems);
  });
}

function entryToTimelineItem(entry: Entry): TopicTimelineItem[] {
  if (entry.kind === "event") {
    return [{ kind: "event", entry: { ...entry, kind: "event" } }];
  }

  if (entry.kind === "review") {
    return [{ kind: "review", entry: { ...entry, kind: "review" } }];
  }

  return [];
}

function assessmentUpdateToTimelineItem(
  assessmentUpdate: AssessmentUpdate
): TopicTimelineItem {
  const { entry, ...assessment } = assessmentUpdate;

  return {
    kind: "assessment",
    entry: { ...entry, kind: "assessment" },
    assessment
  };
}

function compareTimelineItems(
  left: TopicTimelineItem,
  right: TopicTimelineItem
): number {
  const sortAtComparison = right.entry.sortAt.localeCompare(left.entry.sortAt);

  if (sortAtComparison !== 0) {
    return sortAtComparison;
  }

  const createdAtComparison = right.entry.createdAt.localeCompare(
    left.entry.createdAt
  );

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.entry.id.localeCompare(right.entry.id);
}
