import {
  type TopicMetadata,
  updateTopicRequestSchema
} from "@repo/signal-tracker-shared";

import { useUpdateTopicMutation } from "@/api";
import {
  TopicForm,
  TopicFormProvider
} from "@/components/signal-tracker/TopicForm";
import { ContentHeader, useDialogContext } from "@/components/ui";
import { useTopicSettingsModalContext } from "../hooks";

function TopicMetadataSection() {
  const { topic } = useTopicSettingsModalContext();

  return (
    <TopicFormProvider
      initialValues={{
        title: topic.title,
        framingQuestion: topic.framingQuestion,
        scopeNote: topic.scopeNote
      }}
    >
      <TopicMetadataSectionContent />
    </TopicFormProvider>
  );
}

function TopicMetadataSectionContent() {
  const { topic } = useTopicSettingsModalContext();
  const { closeDialog, runDialogConfirm } = useDialogContext();
  const [updateTopic] = useUpdateTopicMutation();

  async function handleUpdate(metadata: TopicMetadata) {
    // TODO: What happens if `parse` throws here?  What is the purpose of `parse`?
    const request = updateTopicRequestSchema.parse({
      topicId: topic.id,
      title: metadata.title,
      framingQuestion: metadata.framingQuestion,
      scopeNote: metadata.scopeNote ?? null
    });

    await runDialogConfirm(async () => updateTopic(request).unwrap());
  }

  return (
    <section>
      <ContentHeader headingLevel={2} headingSize="h5" title="Metadata" />
      <div className="mt-3">
        <TopicForm
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
