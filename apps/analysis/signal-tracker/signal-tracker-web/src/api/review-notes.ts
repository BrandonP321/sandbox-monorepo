import {
  type CreateReviewNoteRequest,
  type CreateReviewNoteResponse,
  type ListReviewNotesRequest,
  type ListReviewNotesResponse
} from "@repo/signal-tracker-shared";

import {
  postSignalTrackerDbBackedApi,
  type DbBackedRequestOptions
} from "./db-backed-request";

export function createReviewNote(
  request: CreateReviewNoteRequest,
  options?: DbBackedRequestOptions
): Promise<CreateReviewNoteResponse> {
  return postSignalTrackerDbBackedApi("createReviewNote", request, options);
}

export function listReviewNotes(
  request: ListReviewNotesRequest,
  options?: DbBackedRequestOptions
): Promise<ListReviewNotesResponse> {
  return postSignalTrackerDbBackedApi("listReviewNotes", request, options);
}
