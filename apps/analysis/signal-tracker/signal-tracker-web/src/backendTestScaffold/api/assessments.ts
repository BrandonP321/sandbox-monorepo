import {
  type CreateAssessmentUpdateRequest,
  type CreateAssessmentUpdateResponse
} from "@repo/signal-tracker-shared";

import {
  postSignalTrackerDbBackedApi,
  type DbBackedRequestOptions
} from "./db-backed-request";

export function createAssessmentUpdate(
  request: CreateAssessmentUpdateRequest,
  options?: DbBackedRequestOptions
): Promise<CreateAssessmentUpdateResponse> {
  return postSignalTrackerDbBackedApi(
    "createAssessmentUpdate",
    request,
    options
  );
}
