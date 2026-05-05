import {
  type Topic,
  type TopicMetadata,
  updateTopicRequestSchema
} from "@repo/signal-tracker-shared";

import { useUpdateTopicMutation } from "@/api";
import { TopicForm } from "@/components/signal-tracker/TopicForm";
import { useDialogContext } from "@/components/ui";

type TopicMetadataSectionProps = {
  topic: Topic;
};

function TopicMetadataSection({ topic }: TopicMetadataSectionProps) {
  const { closeDialog, runDialogConfirm } = useDialogContext();
  const [updateTopic, { errorMessage }] = useUpdateTopicMutation();

  async function handleUpdate(metadata: TopicMetadata) {
    const request = updateTopicRequestSchema.parse({
      topicId: topic.id,
      title: metadata.title,
      framingQuestion: metadata.framingQuestion,
      scopeNote: metadata.scopeNote ?? null
    });

    await runDialogConfirm(async () => updateTopic(request).unwrap());
  }

  return (
    <section aria-labelledby="topic-settings-metadata-heading">
      <h2
        id="topic-settings-metadata-heading"
        className="text-sm font-semibold"
      >
        Metadata
      </h2>
      <div className="mt-3">
        <TopicForm
          error={errorMessage}
          errorTitle="Unable to update topic"
          initialValues={{
            title: topic.title,
            framingQuestion: topic.framingQuestion,
            scopeNote: topic.scopeNote
          }}
          onCancel={closeDialog}
          onSubmit={handleUpdate}
          submitLabel="Save changes"
          submittingLabel="Saving changes..."
        />
      </div>
    </section>
  );
}

export { TopicMetadataSection };
