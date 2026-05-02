import {
  signalTrackerRouteContracts,
  type ListTopicsRequest,
  type ListTopicsResponse
} from "@repo/signal-tracker-shared";

import { signalTrackerApi } from "../signalTrackerApi";

const listTopicsContract = signalTrackerRouteContracts.listTopics;
const defaultListTopicsRequest = {
  query: undefined
} satisfies ListTopicsRequest;

export const topicApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    listTopics: builder.query<ListTopicsResponse, ListTopicsRequest | void>({
      query: (request = defaultListTopicsRequest) => ({
        url: listTopicsContract.route.path,
        method: listTopicsContract.route.method,
        body: listTopicsContract.requestSchema.parse(request)
      }),
      providesTags: ["Topics"],
      transformResponse: (response: unknown) =>
        listTopicsContract.responseSchema.parse(response)
    })
  })
});

export const { useListTopicsQuery } = topicApi;
