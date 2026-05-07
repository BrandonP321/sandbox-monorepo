import { z } from "zod";

import {
  entrySourceInputSchema,
  type AttachedSourceSummary
} from "@repo/signal-tracker-shared";
import { FormProvider } from "@repo/ui-base";

import { useReplaceEntrySourcesMutation } from "@/api";
import { SourceUrlEditor } from "@/components/signal-tracker/SourceUrlEditor";
import { createSourceUrlRowsFromAttachedSources } from "@/components/signal-tracker/SourceUrlEditor/lib/source-url-rows";
import {
  Dialog,
  DialogContent,
  Form,
  FormButton,
  SubmitButton,
  useDialogContext
} from "@/components/ui";

type EntrySourceManagerDialogProps = {
  entryId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  sources: AttachedSourceSummary[];
};

const entrySourceManagerSchema = z.object({
  sources: z.array(entrySourceInputSchema)
});

type EntrySourceManagerFormValues = z.input<typeof entrySourceManagerSchema>;

function EntrySourceManagerDialog({
  entryId,
  onOpenChange,
  open,
  sources
}: EntrySourceManagerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        description="Edit the source URL list attached to this entry."
        title="Manage sources"
      >
        {open ? (
          <EntrySourceManagerForm
            entryId={entryId}
            key={getFormKey(entryId, sources)}
            sources={sources}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EntrySourceManagerForm({
  entryId,
  sources
}: {
  entryId: string;
  sources: AttachedSourceSummary[];
}) {
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

function getFormKey(entryId: string, sources: AttachedSourceSummary[]) {
  return [
    entryId,
    ...createSourceUrlRowsFromAttachedSources(sources).map(
      (source) => source.url
    )
  ].join("|");
}

export { EntrySourceManagerDialog, type EntrySourceManagerDialogProps };
