import { useNavigate } from "@tanstack/react-router";

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
