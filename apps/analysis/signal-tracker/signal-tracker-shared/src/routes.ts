import { z } from "zod";

import {
  createAssessmentUpdateRequestSchema,
  createAssessmentUpdateResponseSchema
} from "./assessment-contracts.js";
import {
  createEventEntryRequestSchema,
  createEventEntryResponseSchema,
  createReviewNoteRequestSchema,
  createReviewNoteResponseSchema,
  getEventEntryRequestSchema,
  getEventEntryResponseSchema,
  getReviewNoteRequestSchema,
  getReviewNoteResponseSchema,
  listEventEntriesRequestSchema,
  listEventEntriesResponseSchema,
  listReviewNotesRequestSchema,
  listReviewNotesResponseSchema,
  updateEventEntryRequestSchema,
  updateEventEntryResponseSchema
} from "./entry-contracts.js";
import {
  createEvidenceItemRequestSchema,
  createEvidenceItemResponseSchema,
  getEvidenceItemRequestSchema,
  getEvidenceItemResponseSchema
} from "./evidence-contracts.js";
import {
  archiveTopicRequestSchema,
  archiveTopicResponseSchema,
  createTopicRequestSchema,
  createTopicResponseSchema,
  deleteTopicRequestSchema,
  deleteTopicResponseSchema,
  getTopicRequestSchema,
  getTopicResponseSchema,
  listTopicsRequestSchema,
  listTopicsResponseSchema,
  updateTopicRequestSchema,
  updateTopicResponseSchema
} from "./topic-contracts.js";

type SignalTrackerRouteSpec = {
  method: "POST";
  path: `/${string}`;
};

export const signalTrackerRoutes = {
  createTopic: {
    method: "POST",
    path: "/create-topic"
  },
  getTopic: {
    method: "POST",
    path: "/get-topic"
  },
  listTopics: {
    method: "POST",
    path: "/list-topics"
  },
  updateTopic: {
    method: "POST",
    path: "/update-topic"
  },
  archiveTopic: {
    method: "POST",
    path: "/archive-topic"
  },
  deleteTopic: {
    method: "POST",
    path: "/delete-topic"
  },
  createEventEntry: {
    method: "POST",
    path: "/create-event-entry"
  },
  createAssessmentUpdate: {
    method: "POST",
    path: "/create-assessment-update"
  },
  createReviewNote: {
    method: "POST",
    path: "/create-review-note"
  },
  getEventEntry: {
    method: "POST",
    path: "/get-event-entry"
  },
  listEventEntries: {
    method: "POST",
    path: "/list-event-entries"
  },
  updateEventEntry: {
    method: "POST",
    path: "/update-event-entry"
  },
  getReviewNote: {
    method: "POST",
    path: "/get-review-note"
  },
  listReviewNotes: {
    method: "POST",
    path: "/list-review-notes"
  },
  createEvidenceItem: {
    method: "POST",
    path: "/create-evidence-item"
  },
  getEvidenceItem: {
    method: "POST",
    path: "/get-evidence-item"
  },
  getHealth: {
    method: "POST",
    path: "/get-health"
  }
} as const satisfies Record<string, SignalTrackerRouteSpec>;

export type SignalTrackerRouteName = keyof typeof signalTrackerRoutes;
export type SignalTrackerRoute =
  (typeof signalTrackerRoutes)[SignalTrackerRouteName];

export const signalTrackerRouteEntries = Object.entries(
  signalTrackerRoutes
) as Array<[SignalTrackerRouteName, SignalTrackerRoute]>;

export const signalTrackerRouteList = signalTrackerRouteEntries.map(
  ([, route]) => route
);

export const signalTrackerHealthRequestSchema = z.object({});
export type SignalTrackerHealthRequest = z.infer<
  typeof signalTrackerHealthRequestSchema
>;

export const signalTrackerHealthResponseSchema = z.object({
  ok: z.boolean()
});

export type SignalTrackerHealthResponse = z.infer<
  typeof signalTrackerHealthResponseSchema
>;

export const signalTrackerRouteContracts = {
  createTopic: {
    route: signalTrackerRoutes.createTopic,
    requestSchema: createTopicRequestSchema,
    responseSchema: createTopicResponseSchema
  },
  getTopic: {
    route: signalTrackerRoutes.getTopic,
    requestSchema: getTopicRequestSchema,
    responseSchema: getTopicResponseSchema
  },
  listTopics: {
    route: signalTrackerRoutes.listTopics,
    requestSchema: listTopicsRequestSchema,
    responseSchema: listTopicsResponseSchema
  },
  updateTopic: {
    route: signalTrackerRoutes.updateTopic,
    requestSchema: updateTopicRequestSchema,
    responseSchema: updateTopicResponseSchema
  },
  archiveTopic: {
    route: signalTrackerRoutes.archiveTopic,
    requestSchema: archiveTopicRequestSchema,
    responseSchema: archiveTopicResponseSchema
  },
  deleteTopic: {
    route: signalTrackerRoutes.deleteTopic,
    requestSchema: deleteTopicRequestSchema,
    responseSchema: deleteTopicResponseSchema
  },
  createEventEntry: {
    route: signalTrackerRoutes.createEventEntry,
    requestSchema: createEventEntryRequestSchema,
    responseSchema: createEventEntryResponseSchema
  },
  createAssessmentUpdate: {
    route: signalTrackerRoutes.createAssessmentUpdate,
    requestSchema: createAssessmentUpdateRequestSchema,
    responseSchema: createAssessmentUpdateResponseSchema
  },
  createReviewNote: {
    route: signalTrackerRoutes.createReviewNote,
    requestSchema: createReviewNoteRequestSchema,
    responseSchema: createReviewNoteResponseSchema
  },
  getEventEntry: {
    route: signalTrackerRoutes.getEventEntry,
    requestSchema: getEventEntryRequestSchema,
    responseSchema: getEventEntryResponseSchema
  },
  listEventEntries: {
    route: signalTrackerRoutes.listEventEntries,
    requestSchema: listEventEntriesRequestSchema,
    responseSchema: listEventEntriesResponseSchema
  },
  updateEventEntry: {
    route: signalTrackerRoutes.updateEventEntry,
    requestSchema: updateEventEntryRequestSchema,
    responseSchema: updateEventEntryResponseSchema
  },
  getReviewNote: {
    route: signalTrackerRoutes.getReviewNote,
    requestSchema: getReviewNoteRequestSchema,
    responseSchema: getReviewNoteResponseSchema
  },
  listReviewNotes: {
    route: signalTrackerRoutes.listReviewNotes,
    requestSchema: listReviewNotesRequestSchema,
    responseSchema: listReviewNotesResponseSchema
  },
  createEvidenceItem: {
    route: signalTrackerRoutes.createEvidenceItem,
    requestSchema: createEvidenceItemRequestSchema,
    responseSchema: createEvidenceItemResponseSchema
  },
  getEvidenceItem: {
    route: signalTrackerRoutes.getEvidenceItem,
    requestSchema: getEvidenceItemRequestSchema,
    responseSchema: getEvidenceItemResponseSchema
  },
  getHealth: {
    route: signalTrackerRoutes.getHealth,
    requestSchema: signalTrackerHealthRequestSchema,
    responseSchema: signalTrackerHealthResponseSchema
  }
} as const satisfies Record<
  SignalTrackerRouteName,
  {
    route: SignalTrackerRoute;
    requestSchema: z.ZodType;
    responseSchema: z.ZodType;
  }
>;

export const signalTrackerRouteContractEntries = Object.entries(
  signalTrackerRouteContracts
) as Array<
  [
    SignalTrackerRouteName,
    (typeof signalTrackerRouteContracts)[SignalTrackerRouteName]
  ]
>;

export type SignalTrackerRouteRequest<TName extends SignalTrackerRouteName> =
  z.infer<(typeof signalTrackerRouteContracts)[TName]["requestSchema"]>;

export type SignalTrackerRouteResponse<TName extends SignalTrackerRouteName> =
  z.infer<(typeof signalTrackerRouteContracts)[TName]["responseSchema"]>;
