import {
  topicMetadataSchema,
  type TopicMetadata
} from "@repo/signal-tracker-shared";
import type { PropsWithChildren } from "react";
import { z } from "zod";

import {
  Form,
  FormButton,
  FormProvider,
  FormTextInput,
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

type TopicFormProviderProps = PropsWithChildren<{
  initialValues?: TopicFormInitialValues;
}>;

function TopicFormProvider({
  children,
  initialValues
}: TopicFormProviderProps) {
  const defaultValues = {
    ...defaultTopicFormValues,
    ...initialValues
  } satisfies TopicFormValues;

  return (
    <FormProvider defaultValues={defaultValues} schema={topicFormSchema}>
      {children}
    </FormProvider>
  );
}

function TopicForm({
  error,
  errorTitle,
  onCancel,
  onSubmit,
  submitLabel,
  submittingLabel
}: TopicFormProps) {
  async function handleSubmit(values: TopicFormValues) {
    const metadata = topicMetadataSchema.parse(values);

    await onSubmit(metadata);
  }

  return (
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
      <FormTextInput<TopicFormValues>
        label="Title"
        name="title"
        placeholder="Iran strike risk"
      />
      <FormTextInput<TopicFormValues>
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
  );
}

export {
  TopicForm,
  TopicFormProvider,
  type TopicFormInitialValues,
  type TopicFormProps,
  type TopicFormProviderProps
};
