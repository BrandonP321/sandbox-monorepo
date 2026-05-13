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
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "../routeContract";
import {
  getMutation,
  getQuery,
  invalidateTagsOnSuccess
} from "@repo/ui-base/rtk-query";
import { signalTrackerApi } from "../signalTrackerApi";

const defaultListTopicsRequest = {
  query: undefined
} satisfies ListTopicsRequest;

export const topicApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    createTopic: builder.mutation<CreateTopicResponse, CreateTopicRequest>({
      query: (request) =>
        buildSignalTrackerRouteRequest("createTopic", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, () => [
          { type: "Topics", id: "LIST" }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("createTopic", response)
    }),
    getTopic: builder.query<GetTopicResponse, GetTopicRequest>({
      query: (request) => buildSignalTrackerRouteRequest("getTopic", request),
      providesTags: (result, _error, request) => [
        { type: "Topic", id: request.topicId },
        ...(result?.currentAssessment
          ? [
              {
                type: "EventEntry" as const,
                id: result.currentAssessment.entry.id
              }
            ]
          : [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("getTopic", response)
    }),
    listTopics: builder.query<ListTopicsResponse, ListTopicsRequest | void>({
      query: (request = defaultListTopicsRequest) =>
        buildSignalTrackerRouteRequest(
          "listTopics",
          request ?? defaultListTopicsRequest
        ),
      providesTags: (result) => [
        { type: "Topics", id: "LIST" },
        ...(result?.topics.map((topic) => ({
          type: "Topic" as const,
          id: topic.id
        })) ?? [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("listTopics", response)
    }),
    updateTopic: builder.mutation<UpdateTopicResponse, UpdateTopicRequest>({
      query: (request) =>
        buildSignalTrackerRouteRequest("updateTopic", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "Topics", id: "LIST" },
          { type: "Topic", id: request.topicId },
          { type: "TopicTimeline", id: result.topic.id }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("updateTopic", response)
    }),
    archiveTopic: builder.mutation<ArchiveTopicResponse, ArchiveTopicRequest>({
      query: (request) =>
        buildSignalTrackerRouteRequest("archiveTopic", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "Topics", id: "LIST" },
          { type: "Topic", id: request.topicId },
          { type: "TopicTimeline", id: result.topic.id }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("archiveTopic", response)
    }),
    deleteTopic: builder.mutation<DeleteTopicResponse, DeleteTopicRequest>({
      query: (request) =>
        buildSignalTrackerRouteRequest("deleteTopic", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "Topics", id: "LIST" },
          { type: "Topic", id: request.topicId },
          { type: "TopicTimeline", id: result.topic.id }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("deleteTopic", response)
    })
  })
});

export const useGetTopicQuery = getQuery(topicApi.useGetTopicQuery, {});

export const useListTopicsQuery = getQuery(topicApi.useListTopicsQuery, {});

export const useArchiveTopicMutation = getMutation(
  topicApi.useArchiveTopicMutation,
  {
    errorTitle: "Unable to archive topic",
    successMessage: ({ topic }) => ({
      content: `${topic.title} is hidden from active topic lists.`,
      header: "Topic archived."
    })
  }
);
export const useCreateTopicMutation = getMutation(
  topicApi.useCreateTopicMutation,
  {
    errorTitle: "Unable to create topic",
    successMessage: ({ topic }) => ({
      content: `${topic.title} is ready to review.`,
      header: "Topic created."
    })
  }
);
export const useDeleteTopicMutation = getMutation(
  topicApi.useDeleteTopicMutation,
  {
    errorTitle: "Unable to delete topic",
    successMessage: ({ topic }) => ({
      content: `${topic.title} was permanently deleted.`,
      header: "Topic deleted."
    })
  }
);
export const useUpdateTopicMutation = getMutation(
  topicApi.useUpdateTopicMutation,
  {
    errorTitle: "Unable to update topic",
    successMessage: ({ topic }) => ({
      content: `${topic.title} has been updated.`,
      header: "Topic updated."
    })
  }
);
