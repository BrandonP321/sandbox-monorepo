import { useState } from "react";

import type { EntryReadModel } from "@repo/signal-tracker-shared";
import { FormProvider } from "@repo/ui-base";

import {
  useCreateEventEntryMutation,
  useUpdateEventEntryMutation
} from "@/api";
import { AddSourceUrlField } from "@/components/signal-tracker/AddSourceUrlField";
import {
  Form,
  FormButton,
  FormDateInput,
  FormSelect,
  FormTextarea,
  FormTextInput,
  SubmitButton,
  useDialogContext
} from "@/components/ui";

import {
  createEventEntryRequest,
  createUpdateEventEntryRequest
} from "../lib/request";
import {
  createDefaultFormValues,
  createEditFormValues,
  epistemicStatusOptions,
  eventEntryFormSchema,
  type EventEntryFormValues
} from "../lib/schema";

type EventEntryFormProps = {
  entry?: EntryReadModel | null;
  topicId: string;
};

function EventEntryForm({ entry, topicId }: EventEntryFormProps) {
  const { closeDialog, runDialogConfirm } = useDialogContext();
  const [createEventEntry, { errorMessage: createErrorMessage }] =
    useCreateEventEntryMutation();
  const [updateEventEntry, { errorMessage: updateErrorMessage }] =
    useUpdateEventEntryMutation();
  const isEditing = entry !== undefined && entry !== null;
  const defaultValues = isEditing
    ? createEditFormValues(entry)
    : createDefaultFormValues();
  const [sourceUrls, setSourceUrls] = useState<string[]>(() =>
    getInitialSourceUrls(entry)
  );

  async function handleSubmit(values: EventEntryFormValues) {
    if (isEditing) {
      const request = createUpdateEventEntryRequest({
        entryId: entry.id,
        sourceUrls,
        values
      });

      await runDialogConfirm(async () => updateEventEntry(request).unwrap());
      return;
    }

    const request = createEventEntryRequest({ sourceUrls, topicId, values });

    await runDialogConfirm(async () => createEventEntry(request).unwrap());
  }

  return (
    <FormProvider defaultValues={defaultValues} schema={eventEntryFormSchema}>
      <Form<EventEntryFormValues>
        actions={
          <>
            <FormButton onClick={closeDialog} variant="outline">
              Cancel
            </FormButton>
            <SubmitButton
              loadingLabel={isEditing ? "Saving event..." : "Adding event..."}
            >
              {isEditing ? "Save event" : "Add event"}
            </SubmitButton>
          </>
        }
        error={isEditing ? updateErrorMessage : createErrorMessage}
        errorTitle={isEditing ? "Unable to save event" : "Unable to add event"}
        onSubmit={handleSubmit}
      >
        <FormTextInput<EventEntryFormValues>
          label="Title"
          name="title"
          placeholder="Court grants injunction"
        />
        <FormTextarea<EventEntryFormValues>
          label="Details"
          name="bodyMd"
          placeholder="What happened, and why does it matter for this topic?"
          rows={5}
        />
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormDateInput<EventEntryFormValues>
            label="Event date"
            name="eventDate"
          />
          <FormSelect<EventEntryFormValues>
            label="Epistemic status"
            name="epistemicStatus"
            options={epistemicStatusOptions}
            placeholder="Choose status"
          />
        </div>
        <AddSourceUrlField
          initialSources={entry?.sources ?? []}
          onSourceUrlsChange={setSourceUrls}
        />
      </Form>
    </FormProvider>
  );
}

function getInitialSourceUrls(entry: EntryReadModel | null | undefined) {
  return (
    entry?.sources.flatMap((source) => {
      const url = source.url ?? source.canonicalUrl;

      return url ? [url] : [];
    }) ?? []
  );
}

export { EventEntryForm, type EventEntryFormProps };
