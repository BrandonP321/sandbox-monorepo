import {
  signalTrackerRouteContracts,
  type ListEvidenceItemsRequest,
  type ListEvidenceItemsResponse
} from "@repo/signal-tracker-shared";

import { signalTrackerApi } from "../signalTrackerApi";

const listEvidenceItemsContract = signalTrackerRouteContracts.listEvidenceItems;
const defaultListEvidenceItemsRequest = {
  query: undefined
} satisfies ListEvidenceItemsRequest;

export const evidenceApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvidenceItems: builder.query<
      ListEvidenceItemsResponse,
      ListEvidenceItemsRequest | void
    >({
      query: (request = defaultListEvidenceItemsRequest) => ({
        url: listEvidenceItemsContract.route.path,
        method: listEvidenceItemsContract.route.method,
        body: listEvidenceItemsContract.requestSchema.parse(request)
      }),
      providesTags: ["Evidence"],
      transformResponse: (response: unknown) =>
        listEvidenceItemsContract.responseSchema.parse(response)
    })
  })
});

export const { useListEvidenceItemsQuery } = evidenceApi;
