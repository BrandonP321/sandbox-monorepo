import { useNavigate } from "@tanstack/react-router";
import type { CreateTopicRequest } from "@repo/signal-tracker-shared";

import { useCreateTopicMutation } from "@/api";
import { TopicForm } from "@/components/signal-tracker";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  useDialogContext
} from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

function CreateTopicDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Create topic</Button>
      </DialogTrigger>
      <CreateTopicDialogContent />
    </Dialog>
  );
}

function CreateTopicDialogContent() {
  const navigate = useNavigate();
  const [createTopic, { errorMessage }] = useCreateTopicMutation();
  const { closeDialog, runDialogConfirm } = useDialogContext();

  async function handleSubmit(request: CreateTopicRequest) {
    const result = await runDialogConfirm(async () =>
      createTopic(request).unwrap()
    );

    if (result.ok) {
      await navigate({
        to: appRoutes.topicDetails.path,
        params: { topicId: result.data.topic.id }
      });
    }
  }

  return (
    <DialogContent
      description="Start a durable dossier with a title, framing question, and optional scope note."
      title="Create topic"
    >
      <TopicForm
        error={errorMessage}
        errorTitle="Unable to create topic"
        onCancel={closeDialog}
        onSubmit={handleSubmit}
      />
    </DialogContent>
  );
}

export { CreateTopicDialog };
