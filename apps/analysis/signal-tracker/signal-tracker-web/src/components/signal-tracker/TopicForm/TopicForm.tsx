import { FormProvider } from "@repo/ui-base";
import {
  topicMetadataSchema,
  type TopicMetadata
} from "@repo/signal-tracker-shared";
import { z } from "zod";

import {
  Form,
  FormButton,
  FormInput,
  FormTextarea,
  SubmitButton
} from "@/components/ui";

const topicFormSchema = topicMetadataSchema;

type TopicFormValues = z.input<typeof topicFormSchema>;

type TopicFormInitialValues = Partial<
  Pick<TopicFormValues, "title" | "framingQuestion" | "scopeNote">
>;

type TopicFormProps = {
  error?: string;
  errorTitle?: string;
  initialValues?: TopicFormInitialValues;
  onCancel: () => void;
  onSubmit: (metadata: TopicMetadata) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
};

const defaultTopicFormValues = {
  title: "",
  framingQuestion: "",
  scopeNote: ""
} satisfies TopicFormValues;

function TopicForm({
  error,
  errorTitle,
  initialValues,
  onCancel,
  onSubmit,
  submitLabel,
  submittingLabel
}: TopicFormProps) {
  const defaultValues = {
    ...defaultTopicFormValues,
    ...initialValues
  } satisfies TopicFormValues;

  async function handleSubmit(values: TopicFormValues) {
    const metadata = topicMetadataSchema.parse(values);

    await onSubmit(metadata);
  }

  return (
    <FormProvider defaultValues={defaultValues} schema={topicFormSchema}>
      <Form<TopicFormValues>
        onSubmit={handleSubmit}
        error={error}
        errorTitle={errorTitle}
        actions={
          <>
            <FormButton onClick={onCancel} variant="outline">
              Cancel
            </FormButton>
            <SubmitButton loadingLabel={submittingLabel}>
              {submitLabel}
            </SubmitButton>
          </>
        }
      >
        <FormInput<TopicFormValues>
          label="Title"
          name="title"
          placeholder="Iran strike risk"
        />
        <FormInput<TopicFormValues>
          label="Framing question"
          name="framingQuestion"
          placeholder="What changed, and what would change the assessment?"
        />
        <FormTextarea<TopicFormValues>
          description="Optional boundary for what belongs in this dossier."
          label="Scope note"
          name="scopeNote"
          placeholder="Track official signals, military movement, and diplomatic constraints."
          rows={4}
        />
      </Form>
    </FormProvider>
  );
}

export { TopicForm, type TopicFormProps };
