import {
  type AttachEntryCitationRequest,
  type AttachEntryCitationResponse,
  type DetachEntryCitationRequest,
  type DetachEntryCitationResponse,
  type ListEntryCitationsRequest,
  type ListEntryCitationsResponse
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

export const citationApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    attachEntryCitation: builder.mutation<
      AttachEntryCitationResponse,
      AttachEntryCitationRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("attachEntryCitation", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "EntryCitations", id: request.entryId },
          { type: "EventEntry", id: request.entryId },
          {
            type: "EntryCitation",
            id: result.citation.citation.id
          }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("attachEntryCitation", response)
    }),
    detachEntryCitation: builder.mutation<
      DetachEntryCitationResponse,
      DetachEntryCitationRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("detachEntryCitation", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "EntryCitations", id: request.entryId },
          { type: "EventEntry", id: request.entryId },
          { type: "EntryCitation", id: request.citationId },
          {
            type: "EntryCitation",
            id: result.citation.citation.id
          }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("detachEntryCitation", response)
    }),
    listEntryCitations: builder.query<
      ListEntryCitationsResponse,
      ListEntryCitationsRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("listEntryCitations", request),
      providesTags: (result, _error, request) => [
        { type: "EntryCitations", id: request.entryId },
        ...(result?.citations.map(({ citation }) => ({
          type: "EntryCitation" as const,
          id: citation.id
        })) ?? [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("listEntryCitations", response)
    })
  })
});

export const useAttachEntryCitationMutation = getMutation(
  citationApi.useAttachEntryCitationMutation,
  {
    errorTitle: "Unable to attach citation",
    successMessage: ({ citation }) => ({
      content: citation.evidence.evidenceItem.title,
      header: "Citation attached."
    })
  }
);
export const useDetachEntryCitationMutation = getMutation(
  citationApi.useDetachEntryCitationMutation,
  {
    errorTitle: "Unable to remove citation",
    successMessage: ({ citation }) => ({
      content: citation.evidence.evidenceItem.title,
      header: "Citation removed."
    })
  }
);
export const useListEntryCitationsQuery = getQuery(
  citationApi.useListEntryCitationsQuery,
  {
    errorTitle: "Unable to load citations"
  }
);
