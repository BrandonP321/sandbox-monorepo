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
  const navigate = useNavigate();
  const [deleteTopic, { errorMessage }] = useDeleteTopicMutation();

  async function handleDelete() {
    await deleteTopic({ topicId }).unwrap();
    await navigate({ to: appRoutes.listTopics.path });
  }

  return (
    <DeleteConfirmationDialog>
      <DeleteConfirmationDialogTrigger>
        <Button variant="danger">Delete topic</Button>
      </DeleteConfirmationDialogTrigger>
      <DeleteConfirmationDialogContent
        cancelButton={{ text: "Keep topic" }}
        confirmationText={topicTitle}
        deleteButton={{
          loadingText: "Deleting topic...",
          text: "Delete permanently"
        }}
        error={{
          message: errorMessage,
          title: "Unable to delete topic"
        }}
        onConfirm={handleDelete}
        title="Delete topic permanently?"
      >
        This permanently removes the topic. Archive is the reversible way to
        hide a topic without losing history.
      </DeleteConfirmationDialogContent>
    </DeleteConfirmationDialog>
  );
}

export { TopicDeleteConfirmation };
