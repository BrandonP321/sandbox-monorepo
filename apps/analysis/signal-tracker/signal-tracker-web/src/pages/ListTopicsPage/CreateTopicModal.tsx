import { useNavigate } from "@tanstack/react-router";
import type { CreateTopicRequest } from "@repo/signal-tracker-shared";
import { useEffect, useState } from "react";

import { useCreateTopicMutation } from "@/api";
import { getApiErrorMessage } from "@/api/apiError";
import { TopicForm } from "@/components/signal-tracker";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  useDialogContext
} from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

function CreateTopicModal() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Create topic</Button>
      </DialogTrigger>
      <CreateTopicModalContent />
    </Dialog>
  );
}

function CreateTopicModalContent() {
  const navigate = useNavigate();
  const [createTopic] = useCreateTopicMutation();
  const [submitError, setSubmitError] = useState<string>();
  const { closeDialog, open, runDialogConfirm } = useDialogContext();

  useEffect(() => {
    if (!open) {
      setSubmitError(undefined);
    }
  }, [open]);

  async function handleSubmit(request: CreateTopicRequest) {
    setSubmitError(undefined);

    const result = await runDialogConfirm(async () =>
      createTopic(request).unwrap()
    );

    if (!result.ok) {
      setSubmitError(getApiErrorMessage(result.error));
      return;
    }

    await navigate({
      to: appRoutes.topicDetails.path,
      params: { topicId: result.data.topic.id }
    });
  }

  function handleCancel() {
    setSubmitError(undefined);
    closeDialog();
  }

  return (
    <DialogContent
      description="Start a durable dossier with a title, framing question, and optional scope note."
      title="Create topic"
    >
      <TopicForm
        error={submitError}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </DialogContent>
  );
}

export { CreateTopicModal };
