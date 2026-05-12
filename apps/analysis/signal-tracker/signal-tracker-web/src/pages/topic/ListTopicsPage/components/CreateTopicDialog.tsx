import { useNavigate } from "@tanstack/react-router";
import {
  createTopicRequestSchema,
  type TopicMetadata
} from "@repo/signal-tracker-shared";

import { useCreateTopicMutation } from "@/api";
import { TopicForm, TopicFormProvider } from "@/components/signal-tracker";
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
  return (
    <DialogContent
      description="Start a durable dossier with a title, framing question, and optional scope note."
      title="Create topic"
    >
      <TopicFormProvider>
        <CreateTopicDialogForm />
      </TopicFormProvider>
    </DialogContent>
  );
}

function CreateTopicDialogForm() {
  const navigate = useNavigate();
  const [createTopic, { errorMessage }] = useCreateTopicMutation();
  const { closeDialog, runDialogConfirm } = useDialogContext();

  async function handleSubmit(metadata: TopicMetadata) {
    const request = createTopicRequestSchema.parse({
      ...metadata,
      reviewCadence: "ad_hoc"
    });
    const result = await runDialogConfirm(async () =>
      createTopic(request).unwrap()
    );

    if (result.ok) {
      const { topic } = result.data;

      await navigate({
        to: appRoutes.topicDetails.path,
        params: { topicId: topic.id, topicTitle: topic.title }
      });
    }
  }

  return (
    <TopicForm
      error={errorMessage}
      errorTitle="Unable to create topic"
      onCancel={closeDialog}
      onSubmit={handleSubmit}
      submitLabel="Create topic"
      submittingLabel="Creating topic..."
    />
  );
}

export { CreateTopicDialog };
