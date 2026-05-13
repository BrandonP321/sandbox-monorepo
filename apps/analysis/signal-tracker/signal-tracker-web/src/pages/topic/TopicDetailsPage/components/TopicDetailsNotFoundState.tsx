import { ButtonLink } from "@repo/dashboard-ui/tanstack-router";

import { ResourceNotFound } from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

type TopicDetailsNotFoundStateProps = {
  topicId: string;
};

// TODO: Can this be abstracted into a component that controls loading, error, and not found states?
function TopicDetailsNotFoundState({
  topicId
}: TopicDetailsNotFoundStateProps) {
  return (
    <ResourceNotFound
      actions={
        <ButtonLink to={appRoutes.listTopics.path} variant="outline">
          Back to topics
        </ButtonLink>
      }
      description={`No topic matched ${topicId}.`}
      title="Topic not found"
    />
  );
}

export { TopicDetailsNotFoundState };
