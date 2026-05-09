import { LoadingState } from "@/components/ui";

import {
  TopicDetailsErrorState,
  TopicDetailsNotFoundState,
  TopicDetailsWorkspace
} from "./components";
import { useTopicDetailsPageTopic } from "./hooks/useTopicDetailsPageTopic";

export function TopicDetailsPage() {
  const {
    currentAssessment,
    errorMessage,
    isError,
    isLoading,
    isTopicNotFound,
    refetchTopic,
    topic,
    topicId
  } = useTopicDetailsPageTopic();

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col">
      {isLoading ? <LoadingState label="Loading topic details" /> : null}

      {!isLoading && isError && isTopicNotFound ? (
        <TopicDetailsNotFoundState topicId={topicId} />
      ) : null}

      {!isLoading && isError && !isTopicNotFound ? (
        <TopicDetailsErrorState
          errorMessage={errorMessage}
          onRetry={refetchTopic}
        />
      ) : null}

      {!isLoading && !isError && topic ? (
        <TopicDetailsWorkspace
          currentAssessment={currentAssessment}
          topic={topic}
        />
      ) : null}
    </section>
  );
}
