import {
  archiveTopicResponseSchema,
  createTopicResponseSchema,
  deleteTopicResponseSchema,
  getTopicResponseSchema,
  listTopicsResponseSchema,
  signalTrackerRoutes,
  updateTopicResponseSchema,
  type ArchiveTopicRequest,
  type ArchiveTopicResponse,
  type CreateTopicRequest,
  type CreateTopicResponse,
  type DeleteTopicRequest,
  type DeleteTopicResponse,
  type GetTopicRequest,
  type GetTopicResponse,
  type ListTopicsRequest,
  type ListTopicsResponse,
  type UpdateTopicRequest,
  type UpdateTopicResponse
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

export function listTopics(
  request: ListTopicsRequest = { query: undefined },
  options?: DbBackedRequestOptions
): Promise<ListTopicsResponse> {
  return postSignalTrackerDbBackedApi(
    {
      route: signalTrackerRoutes.listTopics,
      body: request,
      responseSchema: listTopicsResponseSchema
    },
    options
  );
}

export function updateTopic(
  request: UpdateTopicRequest,
  options?: DbBackedRequestOptions
): Promise<UpdateTopicResponse> {
  return postSignalTrackerDbBackedApi(
    {
      route: signalTrackerRoutes.updateTopic,
      body: request,
      responseSchema: updateTopicResponseSchema
    },
    options
  );
}

export function archiveTopic(
  request: ArchiveTopicRequest,
  options?: DbBackedRequestOptions
): Promise<ArchiveTopicResponse> {
  return postSignalTrackerDbBackedApi(
    {
      route: signalTrackerRoutes.archiveTopic,
      body: request,
      responseSchema: archiveTopicResponseSchema
    },
    options
  );
}

export function deleteTopic(
  request: DeleteTopicRequest,
  options?: DbBackedRequestOptions
): Promise<DeleteTopicResponse> {
  return postSignalTrackerDbBackedApi(
    {
      route: signalTrackerRoutes.deleteTopic,
      body: request,
      responseSchema: deleteTopicResponseSchema
    },
    options
  );
}
