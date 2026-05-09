import { signalTrackerApiErrorCodes } from "@repo/signal-tracker-shared";

import { useGetTopicQuery } from "@/api";
import { isApiErrorCode } from "@/api/apiError";

import { useTopicDetailsPageParams } from "./useTopicDetailsPageParams";

function useTopicDetailsPageTopic() {
  const { topicId } = useTopicDetailsPageParams();
  const { data, error, errorMessage, isError, isLoading, refetch } =
    useGetTopicQuery({ topicId });
  const isTopicNotFound = isApiErrorCode(
    error,
    signalTrackerApiErrorCodes.topicNotFound
  );

  return {
    currentAssessment: data?.currentAssessment ?? null,
    errorMessage,
    isError,
    isLoading,
    isTopicNotFound,
    refetchTopic: refetch,
    topic: data?.topic,
    topicId
  };
}

export { useTopicDetailsPageTopic };
