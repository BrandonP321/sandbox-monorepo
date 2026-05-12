import { signalTrackerIcons as Icons } from "@/components/signal-tracker/signalTrackerIcons";
import { EmptyState } from "@/components/ui";

import { CreateTopicDialog } from "./CreateTopicDialog";

type TopicsListEmptyStateProps = {
  hasQuery: boolean;
};

function TopicsListEmptyState({ hasQuery }: TopicsListEmptyStateProps) {
  return (
    <EmptyState
      action={hasQuery ? undefined : <CreateTopicDialog />}
      description={
        hasQuery
          ? "Adjust the search text to return to the active dossier list."
          : "Create topic will start the next topic dossier."
      }
      icon={<Icons.topicEmptyState className="size-8" strokeWidth={1.75} />}
      title={hasQuery ? "No matching topics found." : "No active topics yet."}
    />
  );
}

export { TopicsListEmptyState };
