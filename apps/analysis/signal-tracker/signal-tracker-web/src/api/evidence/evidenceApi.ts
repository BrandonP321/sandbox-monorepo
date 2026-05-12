import {
  type CaptureEvidenceUrlRequest,
  type CaptureEvidenceUrlResponse,
  type CreateEvidenceAnchorRequest,
  type CreateEvidenceAnchorResponse,
  type CreateEvidenceItemRequest,
  type CreateEvidenceItemResponse,
  type GetEvidenceAnchorRequest,
  type GetEvidenceAnchorResponse,
  type GetEvidenceItemRequest,
  type GetEvidenceItemResponse,
  type ListEvidenceAnchorsForItemRequest,
  type ListEvidenceAnchorsForItemResponse,
  type ListEvidenceItemsRequest,
  type ListEvidenceItemsResponse
} from "@repo/signal-tracker-shared";

import {
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "../routeContract";
import { invalidateTagsOnSuccess } from "../cacheTags";
import { getMutation, getQuery } from "../rtkQueryHooks";
import { signalTrackerApi } from "../signalTrackerApi";

const defaultListEvidenceItemsRequest = {
  query: undefined
} satisfies ListEvidenceItemsRequest;

export const evidenceApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    createEvidenceItem: builder.mutation<
      CreateEvidenceItemResponse,
      CreateEvidenceItemRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("createEvidenceItem", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result) => [
          { type: "Evidence", id: "LIST" },
          { type: "EvidenceItem", id: result.evidenceItem.id }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("createEvidenceItem", response)
    }),
    captureEvidenceUrl: builder.mutation<
      CaptureEvidenceUrlResponse,
      CaptureEvidenceUrlRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("captureEvidenceUrl", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result) => [
          { type: "Evidence", id: "LIST" },
          { type: "EvidenceItem", id: result.evidenceItem.id }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("captureEvidenceUrl", response)
    }),
    getEvidenceItem: builder.query<
      GetEvidenceItemResponse,
      GetEvidenceItemRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("getEvidenceItem", request),
      providesTags: (_result, _error, request) => [
        { type: "EvidenceItem", id: request.evidenceItemId }
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("getEvidenceItem", response)
    }),
    listEvidenceItems: builder.query<
      ListEvidenceItemsResponse,
      ListEvidenceItemsRequest | void
    >({
      query: (request = defaultListEvidenceItemsRequest) =>
        buildSignalTrackerRouteRequest(
          "listEvidenceItems",
          request ?? defaultListEvidenceItemsRequest
        ),
      providesTags: (result) => [
        { type: "Evidence", id: "LIST" },
        ...(result?.evidence.map(({ evidenceItem }) => ({
          type: "EvidenceItem" as const,
          id: evidenceItem.id
        })) ?? [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("listEvidenceItems", response)
    }),
    createEvidenceAnchor: builder.mutation<
      CreateEvidenceAnchorResponse,
      CreateEvidenceAnchorRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("createEvidenceAnchor", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "EvidenceAnchors", id: request.evidenceItemId },
          { type: "EvidenceAnchor", id: result.anchor.id }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("createEvidenceAnchor", response)
    }),
    getEvidenceAnchor: builder.query<
      GetEvidenceAnchorResponse,
      GetEvidenceAnchorRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("getEvidenceAnchor", request),
      providesTags: (_result, _error, request) => [
        { type: "EvidenceAnchor", id: request.anchorId }
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("getEvidenceAnchor", response)
    }),
    listEvidenceAnchorsForItem: builder.query<
      ListEvidenceAnchorsForItemResponse,
      ListEvidenceAnchorsForItemRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("listEvidenceAnchorsForItem", request),
      providesTags: (result, _error, request) => [
        { type: "EvidenceAnchors", id: request.evidenceItemId },
        ...(result?.anchors.map((anchor) => ({
          type: "EvidenceAnchor" as const,
          id: anchor.id
        })) ?? [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("listEvidenceAnchorsForItem", response)
    })
  })
});

export const useCaptureEvidenceUrlMutation = getMutation(
  evidenceApi.useCaptureEvidenceUrlMutation,
  {
    errorTitle: "Unable to capture source",
    successMessage: ({ evidenceItem }) => ({
      content: evidenceItem.title,
      header: "Source captured."
    })
  }
);
export const useCreateEvidenceAnchorMutation = getMutation(
  evidenceApi.useCreateEvidenceAnchorMutation,
  {
    errorTitle: "Unable to create evidence anchor",
    successMessage: "Evidence anchor created."
  }
);
export const useCreateEvidenceItemMutation = getMutation(
  evidenceApi.useCreateEvidenceItemMutation,
  {
    errorTitle: "Unable to create evidence item",
    successMessage: ({ evidenceItem }) => ({
      content: evidenceItem.title,
      header: "Evidence item created."
    })
  }
);
export const useGetEvidenceAnchorQuery = getQuery(
  evidenceApi.useGetEvidenceAnchorQuery,
  {
    errorTitle: "Unable to load evidence anchor"
  }
);
export const useGetEvidenceItemQuery = getQuery(
  evidenceApi.useGetEvidenceItemQuery,
  {
    errorTitle: "Unable to load evidence item"
  }
);
export const useListEvidenceAnchorsForItemQuery = getQuery(
  evidenceApi.useListEvidenceAnchorsForItemQuery,
  {
    errorTitle: "Unable to load evidence anchors"
  }
);
export const useListEvidenceItemsQuery = getQuery(
  evidenceApi.useListEvidenceItemsQuery,
  {
    errorTitle: "Unable to load evidence"
  }
);
