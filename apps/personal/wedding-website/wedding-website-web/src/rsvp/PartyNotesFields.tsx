import { FormField, Textarea } from "../components/ui";
import type { RsvpDraft } from "./rsvpTypes";

type PartyNotesFieldsProps = {
  draft: RsvpDraft;
  onChange: (draft: RsvpDraft) => void;
};

function PartyNotesFields({ draft, onChange }: PartyNotesFieldsProps) {
  return (
    <>
      <FormField
        description="Optional. Include information for anyone in this RSVP."
        id="dietary-notes"
        label="Dietary restrictions or allergies"
      >
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            onChange={(event) =>
              onChange({
                ...draft,
                dietaryOrAllergyNotes: event.currentTarget.value
              })
            }
            rows={4}
            value={draft.dietaryOrAllergyNotes}
          />
        )}
      </FormField>

      <FormField
        description="Optional. Tell us about accessibility or accommodation needs for your party."
        id="accessibility-notes"
        label="Accessibility or accommodations"
      >
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            onChange={(event) =>
              onChange({
                ...draft,
                accessibilityNotes: event.currentTarget.value
              })
            }
            rows={4}
            value={draft.accessibilityNotes}
          />
        )}
      </FormField>

      <FormField
        description="Optional."
        id="general-note"
        label="Anything else you would like us to know?"
      >
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            onChange={(event) =>
              onChange({ ...draft, generalNote: event.currentTarget.value })
            }
            rows={4}
            value={draft.generalNote}
          />
        )}
      </FormField>
    </>
  );
}

export { PartyNotesFields, type PartyNotesFieldsProps };
