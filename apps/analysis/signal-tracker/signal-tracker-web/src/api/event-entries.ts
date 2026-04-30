import {
  type CreateEventEntryRequest,
  type CreateEventEntryResponse,
  type ListEventEntriesRequest,
  type ListEventEntriesResponse
} from "@repo/signal-tracker-shared";

import {
  postSignalTrackerDbBackedApi,
  type DbBackedRequestOptions
} from "./db-backed-request";

export function createEventEntry(
  request: CreateEventEntryRequest,
  options?: DbBackedRequestOptions
): Promise<CreateEventEntryResponse> {
  return postSignalTrackerDbBackedApi("createEventEntry", request, options);
}

export function listEventEntries(
  request: ListEventEntriesRequest,
  options?: DbBackedRequestOptions
): Promise<ListEventEntriesResponse> {
  return postSignalTrackerDbBackedApi("listEventEntries", request, options);
}
