import { createRoute, createRouter, type RouteHandler } from "@repo/api-core";
import {
  signalTrackerRouteContractEntries,
  type SignalTrackerRouteName
} from "@repo/signal-tracker-shared";

import {
  createSignalTrackerApiDependencies,
  type SignalTrackerApiDependencies
} from "./dependencies";
import { createCreateAssessmentUpdateHandler } from "../routes/assessments/create-assessment-update";
import { createCreateEventEntryHandler } from "../routes/event-entries/create-event-entry";
import { createGetEventEntryHandler } from "../routes/event-entries/get-event-entry";
import { createListEventEntriesHandler } from "../routes/event-entries/list-event-entries";
import { createUpdateEventEntryHandler } from "../routes/event-entries/update-event-entry";
import { getHealth } from "../routes/health/get-health";
import { createArchiveTopicHandler } from "../routes/topics/archive-topic";
import { createCreateTopicHandler } from "../routes/topics/create-topic";
import { createDeleteTopicHandler } from "../routes/topics/delete-topic";
import { createGetTopicHandler } from "../routes/topics/get-topic";
import { createListTopicsHandler } from "../routes/topics/list-topics";
import { createUpdateTopicHandler } from "../routes/topics/update-topic";

function createRouteHandlers(
  dependencies: SignalTrackerApiDependencies
): Record<SignalTrackerRouteName, RouteHandler> {
  return {
    createTopic: createCreateTopicHandler({
      repository: dependencies.topicRepository,
      createId: dependencies.createId,
      now: dependencies.now
    }),
    getTopic: createGetTopicHandler({
      repository: dependencies.topicRepository,
      assessmentRepository: dependencies.assessmentRepository
    }),
    listTopics: createListTopicsHandler({
      repository: dependencies.topicRepository
    }),
    updateTopic: createUpdateTopicHandler({
      repository: dependencies.topicRepository,
      now: dependencies.now
    }),
    archiveTopic: createArchiveTopicHandler({
      repository: dependencies.topicRepository,
      now: dependencies.now
    }),
    deleteTopic: createDeleteTopicHandler({
      repository: dependencies.topicRepository
    }),
    createEventEntry: createCreateEventEntryHandler({
      entryRepository: dependencies.entryRepository,
      topicRepository: dependencies.topicRepository,
      generateId: dependencies.generateId,
      now: dependencies.now
    }),
    createAssessmentUpdate: createCreateAssessmentUpdateHandler({
      assessmentRepository: dependencies.assessmentRepository,
      topicRepository: dependencies.topicRepository,
      generateId: dependencies.generateId,
      now: dependencies.now
    }),
    getEventEntry: createGetEventEntryHandler({
      entryRepository: dependencies.entryRepository
    }),
    listEventEntries: createListEventEntriesHandler({
      entryRepository: dependencies.entryRepository
    }),
    updateEventEntry: createUpdateEventEntryHandler({
      entryRepository: dependencies.entryRepository,
      now: dependencies.now
    }),
    getHealth
  };
}

export function createAppRouter(
  dependencies: SignalTrackerApiDependencies = createSignalTrackerApiDependencies()
) {
  const routeHandlers = createRouteHandlers(dependencies);

  return createRouter(
    signalTrackerRouteContractEntries.map(([routeName, contract]) =>
      createRoute(contract.route, routeHandlers[routeName])
    )
  );
}

export const appRouter = createAppRouter();
