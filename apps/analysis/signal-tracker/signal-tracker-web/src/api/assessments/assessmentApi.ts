import {
  type CreateAssessmentUpdateRequest,
  type CreateAssessmentUpdateResponse
} from "@repo/signal-tracker-shared";

import {
  buildSignalTrackerRouteRequest,
  parseSignalTrackerRouteResponse
} from "../routeContract";
import { invalidateTagsOnSuccess } from "../cacheTags";
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
    displayError: false,
    successMessage: ({ assessmentUpdate }) => ({
      content: assessmentUpdate.entry.title,
      header: "Assessment saved."
    })
  }
);
