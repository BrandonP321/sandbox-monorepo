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
import { getMutation, getQuery } from "../rtkQueryHooks";
import { signalTrackerApi } from "../signalTrackerApi";

export const citationApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    attachEntryCitation: builder.mutation<
      AttachEntryCitationResponse,
      AttachEntryCitationRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("attachEntryCitation", request),
      invalidatesTags: (result, _error, request) => [
        { type: "EntryCitations", id: request.entryId },
        ...(result
          ? [
              {
                type: "EntryCitation" as const,
                id: result.citation.citation.id
              }
            ]
          : [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("attachEntryCitation", response)
    }),
    detachEntryCitation: builder.mutation<
      DetachEntryCitationResponse,
      DetachEntryCitationRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("detachEntryCitation", request),
      invalidatesTags: (result, _error, request) => [
        { type: "EntryCitations", id: request.entryId },
        { type: "EntryCitation", id: request.citationId },
        ...(result
          ? [
              {
                type: "EntryCitation" as const,
                id: result.citation.citation.id
              }
            ]
          : [])
      ],
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
  citationApi.useAttachEntryCitationMutation
);
export const useDetachEntryCitationMutation = getMutation(
  citationApi.useDetachEntryCitationMutation
);
export const useListEntryCitationsQuery = getQuery(
  citationApi.useListEntryCitationsQuery
);
