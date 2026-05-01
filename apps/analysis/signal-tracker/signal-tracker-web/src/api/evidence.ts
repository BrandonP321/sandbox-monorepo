import {
  type CaptureEvidenceUrlRequest,
  type CaptureEvidenceUrlResponse,
  type ListEvidenceAnchorsForItemRequest,
  type ListEvidenceAnchorsForItemResponse,
  type ListEvidenceItemsRequest,
  type ListEvidenceItemsResponse
} from "@repo/signal-tracker-shared";

import {
  postSignalTrackerDbBackedApi,
  type DbBackedRequestOptions
} from "./db-backed-request";

export function captureEvidenceUrl(
  request: CaptureEvidenceUrlRequest,
  options?: DbBackedRequestOptions
): Promise<CaptureEvidenceUrlResponse> {
  return postSignalTrackerDbBackedApi("captureEvidenceUrl", request, options);
}

export function listEvidenceItems(
  request: ListEvidenceItemsRequest,
  options?: DbBackedRequestOptions
): Promise<ListEvidenceItemsResponse> {
  return postSignalTrackerDbBackedApi("listEvidenceItems", request, options);
}

export function listEvidenceAnchorsForItem(
  request: ListEvidenceAnchorsForItemRequest,
  options?: DbBackedRequestOptions
): Promise<ListEvidenceAnchorsForItemResponse> {
  return postSignalTrackerDbBackedApi(
    "listEvidenceAnchorsForItem",
    request,
    options
  );
}
