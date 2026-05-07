import { FormProvider } from "@repo/ui-base";

import { useCreateAssessmentUpdateMutation } from "@/api";
import { SourceUrlEditor } from "@/components/signal-tracker/SourceUrlEditor";
import {
  ContentHeader,
  Form,
  FormButton,
  FormDateInput,
  FormNumberInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
  useDialogContext
} from "@/components/ui";

import { createAssessmentUpdateRequest } from "./lib/request";
import {
  assessmentUpdateFormSchema,
  confidenceOptions,
  createDefaultFormValues,
  type AssessmentUpdateFormValues
} from "./lib/schema";

type AssessmentUpdateFormProps = {
  hasCurrentAssessment: boolean;
  topicId: string;
};

function AssessmentUpdateForm({
  hasCurrentAssessment,
  topicId
}: AssessmentUpdateFormProps) {
  const { closeDialog, runDialogConfirm } = useDialogContext();
  const [createAssessmentUpdate, { errorMessage }] =
    useCreateAssessmentUpdateMutation();

  const submitLabel = hasCurrentAssessment
    ? "Update assessment"
    : "Save assessment";

  async function handleSubmit(values: AssessmentUpdateFormValues) {
    const request = createAssessmentUpdateRequest({
      topicId,
      values
    });

    await runDialogConfirm(async () =>
      createAssessmentUpdate(request).unwrap()
    );
  }

  return (
    <FormProvider
      defaultValues={createDefaultFormValues()}
      schema={assessmentUpdateFormSchema}
    >
      <Form<AssessmentUpdateFormValues>
        actions={
          <>
            <FormButton onClick={closeDialog} variant="outline">
              Cancel
            </FormButton>
            <SubmitButton loadingLabel="Saving assessment...">
              {submitLabel}
            </SubmitButton>
          </>
        }
        error={errorMessage}
        errorTitle="Unable to save assessment"
        onSubmit={handleSubmit}
      >
        <FormTextarea<AssessmentUpdateFormValues>
          label="Judgment"
          name="judgment"
          placeholder="What do you currently think, and why?"
          rows={5}
        />
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormSelect<AssessmentUpdateFormValues>
            label="Confidence"
            name="confidenceLabel"
            options={confidenceOptions}
            placeholder="Choose confidence"
          />
          <FormDateInput<AssessmentUpdateFormValues>
            label="Assessment date"
            name="assessmentDate"
          />
        </div>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormTextarea<AssessmentUpdateFormValues>
            description="One assumption per line."
            label="Assumptions"
            name="assumptions"
            rows={4}
          />
          <FormTextarea<AssessmentUpdateFormValues>
            description="One indicator per line."
            label="Indicators"
            name="indicators"
            rows={4}
          />
        </div>
        <AssessmentUpdateOptionalFields />
        <AssessmentSourceFields />
      </Form>
    </FormProvider>
  );
}

function AssessmentUpdateOptionalFields() {
  return (
    <section className="border-border grid gap-4 border-t pt-4">
      <ContentHeader
        description="Add probability and resolution details only when they clarify the assessment."
        headingLevel={3}
        headingSize="h5"
        title="Optional details"
      />
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormNumberInput<AssessmentUpdateFormValues>
          label="Probability"
          name="probabilityPct"
          step={1}
        />
        <FormDateInput<AssessmentUpdateFormValues>
          label="Target resolution date"
          name="targetResolutionDate"
        />
      </div>
      <FormTextarea<AssessmentUpdateFormValues>
        label="Resolution criteria"
        name="resolutionCriteria"
        placeholder="What would resolve or falsify this assessment?"
        rows={3}
      />
    </section>
  );
}

function AssessmentSourceFields() {
  return (
    <section className="border-border grid gap-3 border-t pt-4">
      <ContentHeader
        description="URLs attached to this assessment."
        headingLevel={3}
        headingSize="h5"
        title="Sources"
      />
      <SourceUrlEditor<AssessmentUpdateFormValues> name="sources" />
    </section>
  );
}

export { AssessmentUpdateForm, type AssessmentUpdateFormProps };
