import {
  createTopicResponseSchema,
  getTopicResponseSchema,
  signalTrackerRoutes,
  type CreateTopicRequest,
  type CreateTopicResponse,
  type GetTopicRequest,
  type GetTopicResponse
} from "@repo/signal-tracker-shared";

import {
  postSignalTrackerDbBackedApi,
  type DbBackedRequestOptions
} from "./db-backed-request";

export function createTopic(
  request: CreateTopicRequest,
  options?: DbBackedRequestOptions
): Promise<CreateTopicResponse> {
  return postSignalTrackerDbBackedApi(
    {
      route: signalTrackerRoutes.createTopic,
      body: request,
      responseSchema: createTopicResponseSchema
    },
    options
  );
}

export function getTopic(
  request: GetTopicRequest,
  options?: DbBackedRequestOptions
): Promise<GetTopicResponse> {
  return postSignalTrackerDbBackedApi(
    {
      route: signalTrackerRoutes.getTopic,
      body: request,
      responseSchema: getTopicResponseSchema
    },
    options
  );
}
