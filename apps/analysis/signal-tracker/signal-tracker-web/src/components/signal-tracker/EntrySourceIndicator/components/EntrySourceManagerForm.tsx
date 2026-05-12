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
  return (
    <FormProvider
      defaultValues={{
        sources: createSourceUrlRowsFromAttachedSources(sources)
      }}
      schema={entrySourceManagerSchema}
    >
      <EntrySourceManagerFormContent entryId={entryId} />
    </FormProvider>
  );
}

function EntrySourceManagerFormContent({
  entryId
}: Pick<EntrySourceManagerFormProps, "entryId">) {
  const { closeDialog, runDialogConfirm } = useDialogContext();
  const [replaceEntrySources] = useReplaceEntrySourcesMutation();

  async function handleSubmit(values: EntrySourceManagerFormValues) {
    await runDialogConfirm(async () =>
      replaceEntrySources({ entryId, sources: values.sources }).unwrap()
    );
  }

  return (
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
      onSubmit={handleSubmit}
    >
      <SourceUrlEditor<EntrySourceManagerFormValues> name="sources" />
    </Form>
  );
}

export { EntrySourceManagerForm, type EntrySourceManagerFormProps };
