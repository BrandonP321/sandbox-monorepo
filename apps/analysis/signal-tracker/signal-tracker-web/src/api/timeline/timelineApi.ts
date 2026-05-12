import {
  type ListTopicTimelineRequest,
  type ListTopicTimelineResponse
} from "@repo/signal-tracker-shared";

import {
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "../routeContract";
import { getQuery } from "../rtkQueryHooks";
import { signalTrackerApi } from "../signalTrackerApi";

export const timelineApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    listTopicTimeline: builder.query<
      ListTopicTimelineResponse,
      ListTopicTimelineRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("listTopicTimeline", request),
      providesTags: (result, _error, request) => [
        { type: "TopicTimeline", id: request.topicId },
        ...(result?.items.map(({ entry }) => ({
          type: "EventEntry" as const,
          id: entry.id
        })) ?? [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("listTopicTimeline", response)
    })
  })
});

export const useListTopicTimelineQuery = getQuery(
  timelineApi.useListTopicTimelineQuery,
  {
    displayError: false
  }
);
