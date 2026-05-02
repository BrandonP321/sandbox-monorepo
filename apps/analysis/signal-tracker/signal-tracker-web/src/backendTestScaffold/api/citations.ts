import {
  type AttachEntryCitationRequest,
  type AttachEntryCitationResponse,
  type DetachEntryCitationRequest,
  type DetachEntryCitationResponse,
  type ListEntryCitationsRequest,
  type ListEntryCitationsResponse
} from "@repo/signal-tracker-shared";

import {
  postSignalTrackerDbBackedApi,
  type DbBackedRequestOptions
} from "./db-backed-request";

export function attachEntryCitation(
  request: AttachEntryCitationRequest,
  options?: DbBackedRequestOptions
): Promise<AttachEntryCitationResponse> {
  return postSignalTrackerDbBackedApi("attachEntryCitation", request, options);
}

export function detachEntryCitation(
  request: DetachEntryCitationRequest,
  options?: DbBackedRequestOptions
): Promise<DetachEntryCitationResponse> {
  return postSignalTrackerDbBackedApi("detachEntryCitation", request, options);
}

export function listEntryCitations(
  request: ListEntryCitationsRequest,
  options?: DbBackedRequestOptions
): Promise<ListEntryCitationsResponse> {
  return postSignalTrackerDbBackedApi("listEntryCitations", request, options);
}
