import {
  type CreateEventEntryRequest,
  type CreateEventEntryResponse,
  type GetEventEntryRequest,
  type GetEventEntryResponse,
  type ListEventEntriesRequest,
  type ListEventEntriesResponse,
  type ReplaceEntrySourcesRequest,
  type ReplaceEntrySourcesResponse,
  type UpdateEventEntryRequest,
  type UpdateEventEntryResponse
} from "@repo/signal-tracker-shared";

import {
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "../routeContract";
import {
  getMutation,
  getQuery,
  invalidateTagsOnSuccess
} from "@repo/ui-base/rtk-query";
import { signalTrackerApi } from "../signalTrackerApi";

export const entryApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    createEventEntry: builder.mutation<
      CreateEventEntryResponse,
      CreateEventEntryRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("createEventEntry", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "EventEntries", id: request.topicId },
          { type: "TopicTimeline", id: request.topicId },
          { type: "EventEntry", id: result.entry.id }
        ]),
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
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "EventEntry", id: request.entryId },
          { type: "EventEntries", id: result.entry.topicId },
          { type: "TopicTimeline", id: result.entry.topicId }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("updateEventEntry", response)
    }),
    replaceEntrySources: builder.mutation<
      ReplaceEntrySourcesResponse,
      ReplaceEntrySourcesRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("replaceEntrySources", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "EntryCitations", id: request.entryId },
          { type: "EventEntry", id: request.entryId },
          { type: "EventEntries", id: result.entry.topicId },
          { type: "Topic", id: result.entry.topicId },
          { type: "TopicTimeline", id: result.entry.topicId }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("replaceEntrySources", response)
    })
  })
});

export const useCreateEventEntryMutation = getMutation(
  entryApi.useCreateEventEntryMutation,
  {
    errorTitle: "Unable to add event",
    successMessage: ({ entry }) => ({
      content: entry.title,
      header: "Event added."
    })
  }
);
export const useGetEventEntryQuery = getQuery(entryApi.useGetEventEntryQuery, {
  errorTitle: "Unable to load event"
});
export const useListEventEntriesQuery = getQuery(
  entryApi.useListEventEntriesQuery,
  {
    errorTitle: "Unable to load events"
  }
);
export const useReplaceEntrySourcesMutation = getMutation(
  entryApi.useReplaceEntrySourcesMutation,
  {
    errorTitle: "Unable to save sources",
    successMessage: ({ entry }) => ({
      content: entry.title,
      header: "Sources saved."
    })
  }
);
export const useUpdateEventEntryMutation = getMutation(
  entryApi.useUpdateEventEntryMutation,
  {
    errorTitle: "Unable to save event",
    successMessage: ({ entry }) => ({
      content: entry.title,
      header: "Event saved."
    })
  }
);
