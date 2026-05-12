import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

import { useReplaceEntrySourcesMutation } from "@/api";
import { SourceUrlEditor } from "@/components/signal-tracker/SourceUrlEditor";
import {
  Form,
  FormButton,
  FormProvider,
  SubmitButton,
  useDialogContext
} from "@/components/ui";

import { createSourceUrlRowsFromAttachedSources } from "@/components/signal-tracker/SourceUrlEditor/lib/source-url-rows";
import {
  entrySourceManagerSchema,
  type EntrySourceManagerFormValues
} from "../lib/schema";

type EntrySourceManagerFormProps = {
  entryId: string;
  sources: AttachedSourceSummary[];
};

function EntrySourceManagerForm({
  entryId,
  sources
}: EntrySourceManagerFormProps) {
  const { closeDialog, runDialogConfirm } = useDialogContext();
  const [replaceEntrySources, { errorMessage }] =
    useReplaceEntrySourcesMutation();

  async function handleSubmit(values: EntrySourceManagerFormValues) {
    await runDialogConfirm(async () =>
      replaceEntrySources({ entryId, sources: values.sources }).unwrap()
    );
  }

  return (
    <FormProvider
      defaultValues={{
        sources: createSourceUrlRowsFromAttachedSources(sources)
      }}
      schema={entrySourceManagerSchema}
    >
      <Form<EntrySourceManagerFormValues>
        actions={
          <>
            <FormButton onClick={closeDialog} variant="outline">
              Cancel
            </FormButton>
            <SubmitButton loadingLabel="Saving sources...">
              Save sources
            </SubmitButton>
          </>
        }
        error={errorMessage}
        errorTitle="Unable to save sources"
        onSubmit={handleSubmit}
      >
        <SourceUrlEditor<EntrySourceManagerFormValues> name="sources" />
      </Form>
    </FormProvider>
  );
}

export { EntrySourceManagerForm, type EntrySourceManagerFormProps };
