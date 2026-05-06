import { FormProvider } from "@repo/ui-base";

import { useCreateAssessmentUpdateMutation } from "@/api";
import { AddSourceUrlField } from "@/components/signal-tracker/AddSourceUrlField";
import {
  Form,
  FormButton,
  FormDateInput,
  FormNumberInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
  useDialogContext
} from "@/components/ui";

import { createAssessmentUpdateRequest } from "../lib/request";
import {
  assessmentUpdateComposerSchema,
  confidenceOptions,
  createDefaultFormValues,
  type AssessmentUpdateComposerFormValues
} from "../lib/schema";

type AssessmentUpdateComposerFormProps = {
  hasCurrentAssessment: boolean;
  topicId: string;
};

function AssessmentUpdateComposerForm({
  hasCurrentAssessment,
  topicId
}: AssessmentUpdateComposerFormProps) {
  const { closeDialog, runDialogConfirm } = useDialogContext();
  const [createAssessmentUpdate, { errorMessage }] =
    useCreateAssessmentUpdateMutation();

  const submitLabel = hasCurrentAssessment
    ? "Update assessment"
    : "Save assessment";

  async function handleSubmit(values: AssessmentUpdateComposerFormValues) {
    const request = createAssessmentUpdateRequest({ topicId, values });

    await runDialogConfirm(async () =>
      createAssessmentUpdate(request).unwrap()
    );
  }

  return (
    <FormProvider
      defaultValues={createDefaultFormValues()}
      schema={assessmentUpdateComposerSchema}
    >
      <Form<AssessmentUpdateComposerFormValues>
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
        <FormTextarea<AssessmentUpdateComposerFormValues>
          label="Judgment"
          name="judgment"
          placeholder="What do you currently think, and why?"
          rows={5}
        />
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormSelect<AssessmentUpdateComposerFormValues>
            label="Confidence"
            name="confidenceLabel"
            options={confidenceOptions}
            placeholder="Choose confidence"
          />
          <FormDateInput<AssessmentUpdateComposerFormValues>
            label="Assessment date"
            name="assessmentDate"
          />
        </div>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormTextarea<AssessmentUpdateComposerFormValues>
            description="One assumption per line."
            label="Assumptions"
            name="assumptions"
            rows={4}
          />
          <FormTextarea<AssessmentUpdateComposerFormValues>
            description="One indicator per line."
            label="Indicators"
            name="indicators"
            rows={4}
          />
        </div>
        <AssessmentUpdateOptionalFields />
        <AddSourceUrlField />
      </Form>
    </FormProvider>
  );
}

function AssessmentUpdateOptionalFields() {
  return (
    <section
      aria-labelledby="assessment-optional-fields-heading"
      className="border-border grid gap-4 border-t pt-4"
    >
      <div>
        <h3
          id="assessment-optional-fields-heading"
          className="text-sm font-semibold"
        >
          Optional details
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Add probability and resolution details only when they clarify the
          assessment.
        </p>
      </div>
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormNumberInput<AssessmentUpdateComposerFormValues>
          label="Probability"
          name="probabilityPct"
          step={1}
        />
        <FormDateInput<AssessmentUpdateComposerFormValues>
          label="Target resolution date"
          name="targetResolutionDate"
        />
      </div>
      <FormTextarea<AssessmentUpdateComposerFormValues>
        label="Resolution criteria"
        name="resolutionCriteria"
        placeholder="What would resolve or falsify this assessment?"
        rows={3}
      />
    </section>
  );
}

export { AssessmentUpdateComposerForm };
