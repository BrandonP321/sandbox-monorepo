import { useId, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useDeleteTopicMutation } from "@/api";
import {
  Alert,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  Button,
  Input
} from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

type TopicDeleteConfirmationProps = {
  topicId: string;
  topicTitle: string;
};

// TODO: Refactor once AlertDialog is simplified
function TopicDeleteConfirmation({
  topicId,
  topicTitle
}: TopicDeleteConfirmationProps) {
  const navigate = useNavigate();
  const confirmationInputId = useId();
  const [confirmationText, setConfirmationText] = useState("");
  const [deleteTopic, { errorMessage }] = useDeleteTopicMutation();
  const isConfirmed = confirmationText === topicTitle;

  async function handleDelete() {
    await deleteTopic({ topicId }).unwrap();
    await navigate({ to: appRoutes.listTopics.path });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="danger">Delete topic</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        cancelText="Keep topic"
        confirmDisabled={!isConfirmed}
        confirmText="Delete permanently"
        description="This permanently removes the topic. Archive is the reversible way to hide a topic without losing history."
        loadingText="Deleting topic..."
        onConfirm={handleDelete}
        title="Delete topic permanently?"
      >
        <div className="grid gap-3">
          <p className="text-muted-foreground text-sm">
            Type{" "}
            <span className="font-medium text-foreground">{topicTitle}</span> to
            confirm.
          </p>
          <div className="grid gap-2">
            <label
              className="text-sm font-medium"
              htmlFor={confirmationInputId}
            >
              Topic title
            </label>
            <Input
              id={confirmationInputId}
              onChange={(event) => setConfirmationText(event.target.value)}
              value={confirmationText}
            />
          </div>
          {errorMessage ? (
            <Alert title="Unable to delete topic" variant="danger">
              {errorMessage}
            </Alert>
          ) : null}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { TopicDeleteConfirmation };
