import {
  type ListTopicTimelineRequest,
  type ListTopicTimelineResponse
} from "@repo/signal-tracker-shared";

import {
  postSignalTrackerDbBackedApi,
  type DbBackedRequestOptions
} from "./db-backed-request";

export function listTopicTimeline(
  request: ListTopicTimelineRequest,
  options?: DbBackedRequestOptions
): Promise<ListTopicTimelineResponse> {
  return postSignalTrackerDbBackedApi("listTopicTimeline", request, options);
}
