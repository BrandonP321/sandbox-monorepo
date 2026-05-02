import {
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
  return postSignalTrackerDbBackedApi("createTopic", request, options);
}

export function getTopic(
  request: GetTopicRequest,
  options?: DbBackedRequestOptions
): Promise<GetTopicResponse> {
  return postSignalTrackerDbBackedApi("getTopic", request, options);
}

export function listTopics(
  request: ListTopicsRequest = { query: undefined },
  options?: DbBackedRequestOptions
): Promise<ListTopicsResponse> {
  return postSignalTrackerDbBackedApi("listTopics", request, options);
}

export function updateTopic(
  request: UpdateTopicRequest,
  options?: DbBackedRequestOptions
): Promise<UpdateTopicResponse> {
  return postSignalTrackerDbBackedApi("updateTopic", request, options);
}

export function archiveTopic(
  request: ArchiveTopicRequest,
  options?: DbBackedRequestOptions
): Promise<ArchiveTopicResponse> {
  return postSignalTrackerDbBackedApi("archiveTopic", request, options);
}

export function deleteTopic(
  request: DeleteTopicRequest,
  options?: DbBackedRequestOptions
): Promise<DeleteTopicResponse> {
  return postSignalTrackerDbBackedApi("deleteTopic", request, options);
}
