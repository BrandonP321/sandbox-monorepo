import type {
  AssessmentUpdateReadModel,
  Topic
} from "@repo/signal-tracker-shared";

import {
  CurrentAssessmentPanel,
  TopicTimeline
} from "@/components/signal-tracker";
import { WithAside } from "@/components/ui";

import { TopicDetailsHeader } from "./TopicDetailsHeader";

type TopicDetailsWorkspaceProps = {
  currentAssessment: AssessmentUpdateReadModel | null;
  topic: Topic;
};

function TopicDetailsWorkspace({
  currentAssessment,
  topic
}: TopicDetailsWorkspaceProps) {
  return (
    <>
      <TopicDetailsHeader topic={topic} />

      <WithAside
        aside={
          <CurrentAssessmentPanel
            assessment={currentAssessment}
            topicId={topic.id}
          />
        }
        className="py-5"
        stickyAside
      >
        <TopicTimeline topicId={topic.id} />
      </WithAside>
    </>
  );
}

export { TopicDetailsWorkspace };
