import {
  type CreateAssessmentUpdateRequest,
  type CreateAssessmentUpdateResponse
} from "@repo/signal-tracker-shared";

import {
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "../routeContract";
import { getMutation, invalidateTagsOnSuccess } from "@repo/ui-base/rtk-query";
import { signalTrackerApi } from "../signalTrackerApi";

export const assessmentApi = signalTrackerApi.injectEndpoints({
  endpoints: (builder) => ({
    createAssessmentUpdate: builder.mutation<
      CreateAssessmentUpdateResponse,
      CreateAssessmentUpdateRequest
    >({
      query: (request) =>
        buildSignalTrackerRouteRequest("createAssessmentUpdate", request),
      invalidatesTags: (result, error, request) =>
        invalidateTagsOnSuccess(result, error, request, (result, request) => [
          { type: "Topic", id: request.topicId },
          { type: "TopicTimeline", id: request.topicId },
          { type: "EventEntries", id: request.topicId },
          {
            type: "EventEntry",
            id: result.assessmentUpdate.entry.id
          }
        ]),
      transformResponse: (response: unknown) =>
        parseSignalTrackerRouteResponse("createAssessmentUpdate", response)
    })
  })
});

export const useCreateAssessmentUpdateMutation = getMutation(
  assessmentApi.useCreateAssessmentUpdateMutation,
  {
    errorTitle: "Unable to save assessment",
    successMessage: ({ assessmentUpdate }) => ({
      content: assessmentUpdate.entry.title,
      // TODO: Remove periods from all message titles
      header: "Assessment saved."
    })
  }
);
