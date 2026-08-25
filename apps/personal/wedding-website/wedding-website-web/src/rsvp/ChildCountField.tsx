import { FormField, TextInput } from "../components/ui";
import type { RsvpDraft } from "./rsvpTypes";

type ChildCountFieldProps = {
  draft: RsvpDraft;
  error?: string;
  onChange: (draft: RsvpDraft) => void;
  onClearError: () => void;
};

function ChildCountField({
  draft,
  error,
  onChange,
  onClearError
}: ChildCountFieldProps) {
  return (
    <FormField
      description="Enter 0 if no children are included in this RSVP."
      error={error}
      id="child-count"
      label="Number of children attending"
      required
    >
      {(fieldProps) => (
        <TextInput
          {...fieldProps}
          inputMode="numeric"
          min={0}
          onChange={(event) => {
            const value = event.currentTarget.value;
            onChange({
              ...draft,
              childrenAttending: value === "" ? 0 : Number(value)
            });
            onClearError();
          }}
          step={1}
          type="number"
          value={draft.childrenAttending}
        />
      )}
    </FormField>
  );
}

export { ChildCountField, type ChildCountFieldProps };
