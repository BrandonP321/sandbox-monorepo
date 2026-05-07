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
import { hydrateEntryReadModels } from "../../domain/entries/entry-read-models";
import type { EntryRepository } from "../../domain/entries/entry-repository";
import type { EntrySourceSummaryRepository } from "../../domain/entries/entry-source-summary-repository";

type ListTopicTimelineHandlerDependencies = {
  entryRepository: Pick<EntryRepository, "listByTopic">;
  assessmentRepository: Pick<AssessmentRepository, "listActiveByTopic">;
  entrySourceSummaryRepository: EntrySourceSummaryRepository;
};

type UnhydratedTopicTimelineItem =
  | {
      kind: "event";
      entry: Entry & { kind: "event" };
    }
  | {
      kind: "review";
      entry: Entry & { kind: "review" };
    }
  | {
      kind: "assessment";
      entry: Entry & { kind: "assessment" };
      assessment: Omit<AssessmentUpdate, "entry">;
    };

export function createListTopicTimelineHandler(
  dependencies: ListTopicTimelineHandlerDependencies
): RouteHandler {
  return createJsonRouteHandler({
    contract: signalTrackerRouteContracts.listTopicTimeline,
    handle: async (request) => {
      const items = await listActiveTopicTimelineItems(
        request.topicId,
        request.limit,
        dependencies
      );

      return { items };
    }
  });
}

async function listActiveTopicTimelineItems(
  topicId: string,
  limit: number | undefined,
  dependencies: ListTopicTimelineHandlerDependencies
): Promise<TopicTimelineItem[]> {
  return withPersistenceErrorMapping(async () => {
    const [entries, assessmentUpdates] = await Promise.all([
      dependencies.entryRepository.listByTopic(topicId),
      dependencies.assessmentRepository.listActiveByTopic(topicId)
    ]);

    const unhydratedItems = [
      ...entries.flatMap(entryToTimelineItem),
      ...assessmentUpdates.map(assessmentUpdateToTimelineItem)
    ].sort(compareTimelineItems);
    const limitedItems =
      limit === undefined ? unhydratedItems : unhydratedItems.slice(0, limit);

    return await hydrateTimelineItems(limitedItems, dependencies);
  });
}

function entryToTimelineItem(entry: Entry): UnhydratedTopicTimelineItem[] {
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
): UnhydratedTopicTimelineItem {
  const { entry, ...assessment } = assessmentUpdate;

  return {
    kind: "assessment",
    entry: { ...entry, kind: "assessment" },
    assessment
  };
}

async function hydrateTimelineItems(
  items: UnhydratedTopicTimelineItem[],
  dependencies: ListTopicTimelineHandlerDependencies
): Promise<TopicTimelineItem[]> {
  const entries = await hydrateEntryReadModels(
    items.map((item) => item.entry),
    dependencies.entrySourceSummaryRepository
  );
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));

  return items.map((item) => {
    const entry = entriesById.get(item.entry.id);

    if (!entry) {
      throw new Error("Timeline entry hydration did not return an entry");
    }

    if (item.kind === "event") {
      return {
        kind: "event",
        entry: { ...entry, kind: "event" }
      };
    }

    if (item.kind === "review") {
      return {
        kind: "review",
        entry: { ...entry, kind: "review" }
      };
    }

    return {
      kind: "assessment",
      entry: { ...entry, kind: "assessment" },
      assessment: item.assessment
    };
  });
}

function compareTimelineItems(
  left: Pick<UnhydratedTopicTimelineItem, "entry">,
  right: Pick<UnhydratedTopicTimelineItem, "entry">
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
