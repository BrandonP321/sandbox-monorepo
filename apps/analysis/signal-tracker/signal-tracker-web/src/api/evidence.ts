import {
  type CaptureEvidenceUrlRequest,
  type CaptureEvidenceUrlResponse
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
