import { EmptyState } from "@/components/ui";
import { Radar } from "lucide-react";
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
      icon={<Radar className="size-8" strokeWidth={1.75} />}
      title={hasQuery ? "No matching topics found." : "No active topics yet."}
    />
  );
}

export { TopicsListEmptyState };
