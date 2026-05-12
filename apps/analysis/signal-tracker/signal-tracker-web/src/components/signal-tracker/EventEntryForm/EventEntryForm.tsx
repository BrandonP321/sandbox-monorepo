import type { EntryReadModel } from "@repo/signal-tracker-shared";

import {
  useCreateEventEntryMutation,
  useUpdateEventEntryMutation
} from "@/api";
import { SourceUrlFormSection } from "@/components/signal-tracker/SourceUrlEditor";
import {
  AutoGrid,
  Form,
  FormButton,
  FormDateInput,
  FormProvider,
  FormSelect,
  FormTextarea,
  FormTextInput,
  SubmitButton,
  useDialogContext
} from "@/components/ui";

import {
  createEventEntryRequest,
  createUpdateEventEntryRequest
} from "./lib/request";
import {
  createDefaultFormValues,
  createEditFormValues,
  epistemicStatusOptions,
  eventEntryFormSchema,
  type EventEntryFormValues
} from "./lib/schema";

type EventEntryFormProps = {
  entry?: EntryReadModel | null;
  topicId: string;
};

function EventEntryForm({ entry, topicId }: EventEntryFormProps) {
  const isEditing = entry !== undefined && entry !== null;
  const defaultValues = isEditing
    ? createEditFormValues(entry)
    : createDefaultFormValues();

  return (
    <FormProvider defaultValues={defaultValues} schema={eventEntryFormSchema}>
      <EventEntryFormContent
        entry={entry}
        isEditing={isEditing}
        topicId={topicId}
      />
    </FormProvider>
  );
}

type EventEntryFormContentProps = EventEntryFormProps & {
  isEditing: boolean;
};

function EventEntryFormContent({
  entry,
  isEditing,
  topicId
}: EventEntryFormContentProps) {
  const { closeDialog, runDialogConfirm } = useDialogContext();

  const [createEventEntry] = useCreateEventEntryMutation();

  const [updateEventEntry] = useUpdateEventEntryMutation();

  async function handleSubmit(values: EventEntryFormValues) {
    if (isEditing && entry) {
      const request = createUpdateEventEntryRequest({
        entryId: entry.id,
        values
      });

      await runDialogConfirm(async () => updateEventEntry(request).unwrap());
      return;
    }

    const request = createEventEntryRequest({ topicId, values });

    await runDialogConfirm(async () => createEventEntry(request).unwrap());
  }

  return (
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
      <AutoGrid>
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
      </AutoGrid>
      <SourceUrlFormSection<EventEntryFormValues>
        description="URLs attached to this event."
        name="sources"
      />
    </Form>
  );
}

export { EventEntryForm, type EventEntryFormProps };
