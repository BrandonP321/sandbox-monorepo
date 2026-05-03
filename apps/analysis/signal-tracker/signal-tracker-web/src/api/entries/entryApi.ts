import {
  type CreateEventEntryRequest,
  type CreateEventEntryResponse,
  type GetEventEntryRequest,
  type GetEventEntryResponse,
  type ListEventEntriesRequest,
  type ListEventEntriesResponse,
  type UpdateEventEntryRequest,
  type UpdateEventEntryResponse
} from "@repo/signal-tracker-shared";

import {
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "../routeContract";
import { signalTrackerApi } from "../signalTrackerApi";

export const entryApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    createEventEntry: builder.mutation<
      CreateEventEntryResponse,
      CreateEventEntryRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("createEventEntry", request),
      invalidatesTags: (result, _error, request) => [
        { type: "EventEntries", id: request.topicId },
        { type: "TopicTimeline", id: request.topicId },
        ...(result
          ? [{ type: "EventEntry" as const, id: result.entry.id }]
          : [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("createEventEntry", response)
    }),
    getEventEntry: builder.query<GetEventEntryResponse, GetEventEntryRequest>({
      query: (request) =>
        buildSignalTrackerRouteRequest("getEventEntry", request),
      providesTags: (_result, _error, request) => [
        { type: "EventEntry", id: request.entryId }
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("getEventEntry", response)
    }),
    listEventEntries: builder.query<
      ListEventEntriesResponse,
      ListEventEntriesRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("listEventEntries", request),
      providesTags: (result, _error, request) => [
        { type: "EventEntries", id: request.topicId },
        ...(result?.entries.map((entry) => ({
          type: "EventEntry" as const,
          id: entry.id
        })) ?? [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("listEventEntries", response)
    }),
    updateEventEntry: builder.mutation<
      UpdateEventEntryResponse,
      UpdateEventEntryRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("updateEventEntry", request),
      invalidatesTags: (result, _error, request) => [
        { type: "EventEntry", id: request.entryId },
        ...(result
          ? [
              { type: "EventEntries" as const, id: result.entry.topicId },
              { type: "TopicTimeline" as const, id: result.entry.topicId }
            ]
          : [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("updateEventEntry", response)
    })
  })
});

export const {
  useCreateEventEntryMutation,
  useGetEventEntryQuery,
  useListEventEntriesQuery,
  useUpdateEventEntryMutation
} = entryApi;
