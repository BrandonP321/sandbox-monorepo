import {
  createEventEntryRequestSchema,
  updateEventEntryRequestSchema,
  type CreateEventEntryRequest,
  type EntrySourceInput,
  type UpdateEventEntryRequest
} from "@repo/signal-tracker-shared";

import { toDateStart } from "./date-input";
import type { EventEntryFormValues } from "./schema";

function createEventEntryRequest({
  sourceUrls,
  topicId,
  values
}: {
  sourceUrls: string[];
  topicId: string;
  values: EventEntryFormValues;
}): CreateEventEntryRequest {
  const sources = createSourceInputs(sourceUrls);

  return createEventEntryRequestSchema.parse({
    topicId,
    title: values.title,
    bodyMd: values.bodyMd,
    sortAt: toDateStart(values.eventDate),
    epistemicStatus: values.epistemicStatus,
    ...(sources.length === 0 ? {} : { sources })
  });
}

function createUpdateEventEntryRequest({
  entryId,
  sourceUrls,
  values
}: {
  entryId: string;
  sourceUrls: string[];
  values: EventEntryFormValues;
}): UpdateEventEntryRequest {
  return updateEventEntryRequestSchema.parse({
    entryId,
    title: values.title,
    bodyMd: values.bodyMd,
    sortAt: toDateStart(values.eventDate),
    epistemicStatus: values.epistemicStatus,
    sources: createSourceInputs(sourceUrls)
  });
}

function createSourceInputs(sourceUrls: string[]): EntrySourceInput[] {
  return sourceUrls.map((url) => ({ url }));
}

export { createEventEntryRequest, createUpdateEventEntryRequest };
