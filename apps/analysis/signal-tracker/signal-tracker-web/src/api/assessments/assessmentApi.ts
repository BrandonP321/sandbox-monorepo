import {
  type CreateAssessmentUpdateRequest,
  type CreateAssessmentUpdateResponse
} from "@repo/signal-tracker-shared";

import {
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "../routeContract";
import { getMutation } from "../rtkQueryHooks";
import { signalTrackerApi } from "../signalTrackerApi";

export const assessmentApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    createAssessmentUpdate: builder.mutation<
      CreateAssessmentUpdateResponse,
      CreateAssessmentUpdateRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("createAssessmentUpdate", request),
      invalidatesTags: (result, _error, request) => [
        { type: "Topic", id: request.topicId },
        { type: "TopicTimeline", id: request.topicId },
        { type: "EventEntries", id: request.topicId },
        ...(result
          ? [
              {
                type: "EventEntry" as const,
                id: result.assessmentUpdate.entry.id
              }
            ]
          : [])
      ],
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("createAssessmentUpdate", response)
    })
  })
});

export const useCreateAssessmentUpdateMutation = getMutation(
  assessmentApi.useCreateAssessmentUpdateMutation
);
