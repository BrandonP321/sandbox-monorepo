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
import { createAttachEntryCitationHandler } from "../routes/citations/attach-entry-citation";
import { createDetachEntryCitationHandler } from "../routes/citations/detach-entry-citation";
import { createListEntryCitationsHandler } from "../routes/citations/list-entry-citations";
import { createCaptureEvidenceUrlHandler } from "../routes/evidence/capture-evidence-url";
import { createCreateEvidenceAnchorHandler } from "../routes/evidence/create-evidence-anchor";
import { createCreateEvidenceItemHandler } from "../routes/evidence/create-evidence-item";
import { createGetEvidenceAnchorHandler } from "../routes/evidence/get-evidence-anchor";
import { createGetEvidenceItemHandler } from "../routes/evidence/get-evidence-item";
import { createListEvidenceAnchorsForItemHandler } from "../routes/evidence/list-evidence-anchors-for-item";
import { createCreateEventEntryHandler } from "../routes/event-entries/create-event-entry";
import { createGetEventEntryHandler } from "../routes/event-entries/get-event-entry";
import { createListEventEntriesHandler } from "../routes/event-entries/list-event-entries";
import { createUpdateEventEntryHandler } from "../routes/event-entries/update-event-entry";
import { getHealth } from "../routes/health/get-health";
import { createCreateReviewNoteHandler } from "../routes/review-notes/create-review-note";
import { createGetReviewNoteHandler } from "../routes/review-notes/get-review-note";
import { createListReviewNotesHandler } from "../routes/review-notes/list-review-notes";
import { createListTopicTimelineHandler } from "../routes/timeline/list-topic-timeline";
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
    createReviewNote: createCreateReviewNoteHandler({
      entryRepository: dependencies.entryRepository,
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
    getReviewNote: createGetReviewNoteHandler({
      entryRepository: dependencies.entryRepository
    }),
    listReviewNotes: createListReviewNotesHandler({
      entryRepository: dependencies.entryRepository
    }),
    listTopicTimeline: createListTopicTimelineHandler({
      entryRepository: dependencies.entryRepository,
      assessmentRepository: dependencies.assessmentRepository
    }),
    createEvidenceItem: createCreateEvidenceItemHandler({
      evidenceRepository: dependencies.evidenceRepository,
      generateId: dependencies.generateId,
      now: dependencies.now
    }),
    captureEvidenceUrl: createCaptureEvidenceUrlHandler({
      evidenceRepository: dependencies.evidenceRepository,
      generateId: dependencies.generateId,
      now: dependencies.now
    }),
    getEvidenceItem: createGetEvidenceItemHandler({
      evidenceRepository: dependencies.evidenceRepository
    }),
    createEvidenceAnchor: createCreateEvidenceAnchorHandler({
      evidenceAnchorRepository: dependencies.evidenceAnchorRepository,
      evidenceRepository: dependencies.evidenceRepository,
      generateId: dependencies.generateId,
      now: dependencies.now
    }),
    getEvidenceAnchor: createGetEvidenceAnchorHandler({
      evidenceAnchorRepository: dependencies.evidenceAnchorRepository
    }),
    listEvidenceAnchorsForItem: createListEvidenceAnchorsForItemHandler({
      evidenceAnchorRepository: dependencies.evidenceAnchorRepository,
      evidenceRepository: dependencies.evidenceRepository
    }),
    attachEntryCitation: createAttachEntryCitationHandler({
      entryCitationRepository: dependencies.entryCitationRepository,
      entryRepository: dependencies.entryRepository,
      evidenceRepository: dependencies.evidenceRepository,
      evidenceAnchorRepository: dependencies.evidenceAnchorRepository,
      generateId: dependencies.generateId,
      now: dependencies.now
    }),
    detachEntryCitation: createDetachEntryCitationHandler({
      entryCitationRepository: dependencies.entryCitationRepository,
      entryRepository: dependencies.entryRepository,
      evidenceRepository: dependencies.evidenceRepository,
      evidenceAnchorRepository: dependencies.evidenceAnchorRepository
    }),
    listEntryCitations: createListEntryCitationsHandler({
      entryCitationRepository: dependencies.entryCitationRepository,
      entryRepository: dependencies.entryRepository,
      evidenceRepository: dependencies.evidenceRepository,
      evidenceAnchorRepository: dependencies.evidenceAnchorRepository
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
