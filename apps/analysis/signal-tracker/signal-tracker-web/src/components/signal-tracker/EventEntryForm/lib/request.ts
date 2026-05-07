import {
  createEventEntryRequestSchema,
  updateEventEntryRequestSchema,
  type CreateEventEntryRequest,
  type UpdateEventEntryRequest
} from "@repo/signal-tracker-shared";

import { toDateStart } from "./date-input";
import type { EventEntryFormValues } from "./schema";

function createEventEntryRequest({
  topicId,
  values
}: {
  topicId: string;
  values: EventEntryFormValues;
}): CreateEventEntryRequest {
  return createEventEntryRequestSchema.parse({
    topicId,
    title: values.title,
    bodyMd: values.bodyMd,
    sortAt: toDateStart(values.eventDate),
    epistemicStatus: values.epistemicStatus,
    ...(values.sources.length === 0 ? {} : { sources: values.sources })
  });
}

function createUpdateEventEntryRequest({
  entryId,
  values
}: {
  entryId: string;
  values: EventEntryFormValues;
}): UpdateEventEntryRequest {
  return updateEventEntryRequestSchema.parse({
    entryId,
    title: values.title,
    bodyMd: values.bodyMd,
    sortAt: toDateStart(values.eventDate),
    epistemicStatus: values.epistemicStatus,
    sources: values.sources
  });
}

export { createEventEntryRequest, createUpdateEventEntryRequest };
