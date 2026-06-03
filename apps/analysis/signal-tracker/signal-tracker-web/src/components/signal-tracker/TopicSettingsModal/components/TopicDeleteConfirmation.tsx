import { useNavigate } from "@tanstack/react-router";
import { isSignalTrackerProtectedDemoTopicId } from "@repo/signal-tracker-shared";

import { useDeleteTopicMutation } from "@/api";
import {
  Button,
  DeleteConfirmationDialog,
  DeleteConfirmationDialogContent,
  DeleteConfirmationDialogTrigger
} from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

type TopicDeleteConfirmationProps = {
  topicId: string;
  topicTitle: string;
};

function TopicDeleteConfirmation({
  topicId,
  topicTitle
}: TopicDeleteConfirmationProps) {
  if (isSignalTrackerProtectedDemoTopicId(topicId)) {
    return (
      <div className="grid gap-2">
        <Button disabled variant="danger">
          Delete topic
        </Button>
        <p className="text-muted-foreground text-sm">
          Deletion is temporarily disabled for this demo topic.
        </p>
      </div>
    );
  }

  return (
    <DeleteConfirmationDialog>
      <DeleteConfirmationDialogTrigger>
        <Button variant="danger">Delete topic</Button>
      </DeleteConfirmationDialogTrigger>
      <TopicDeleteConfirmationContent
        topicId={topicId}
        topicTitle={topicTitle}
      />
    </DeleteConfirmationDialog>
  );
}

function TopicDeleteConfirmationContent({
  topicId,
  topicTitle
}: TopicDeleteConfirmationProps) {
  const navigate = useNavigate();
  const [deleteTopic] = useDeleteTopicMutation();

  async function handleDelete() {
    await deleteTopic({ topicId }).unwrap();
    await navigate({ to: appRoutes.listTopics.path });
  }

  return (
    <DeleteConfirmationDialogContent
      cancelButton={{ text: "Keep topic" }}
      confirmationText={topicTitle}
      deleteButton={{
        loadingText: "Deleting topic...",
        text: "Delete permanently"
      }}
      onConfirm={handleDelete}
      title="Delete topic permanently?"
    >
      This permanently removes the topic. Archive is the reversible way to hide
      a topic without losing history.
    </DeleteConfirmationDialogContent>
  );
}

export { TopicDeleteConfirmation };
