import {
  Button,
  ChoiceGroup,
  ChoiceRow,
  FormField,
  TextInput
} from "../components/ui";
import { AdultContactFields } from "./AdultContactFields";
import { updateAdult } from "./rsvpDraft";
import type { AdultAttendee, AttendanceStatus, RsvpDraft } from "./rsvpTypes";
import type { AdultFieldErrors } from "./rsvpValidation";

type AdultAttendanceFieldsProps = {
  adult: AdultAttendee;
  contactErrorId?: string;
  draft: RsvpDraft;
  errors?: AdultFieldErrors;
  index: number;
  onChange: (draft: RsvpDraft) => void;
  onClearContactError: () => void;
  onClearError: (field: keyof AdultFieldErrors) => void;
  onRemove?: () => void;
};

const attendanceOptions: readonly {
  label: string;
  value: AttendanceStatus;
}[] = [
  { label: "Attending", value: "attending" },
  { label: "Not sure yet", value: "not-sure" },
  { label: "Unable to attend", value: "unable" }
];

function AdultAttendanceFields({
  adult,
  contactErrorId,
  draft,
  errors,
  index,
  onChange,
  onClearContactError,
  onClearError,
  onRemove
}: AdultAttendanceFieldsProps) {
  const isRespondent = index === 0;
  const title = isRespondent ? "You" : `Adult ${index + 1}`;

  return (
    <section
      aria-labelledby={`adult-heading-${adult.id}`}
      className="adult-response"
    >
      <div className="adult-response__heading">
        <span className="adult-response__number">{index + 1}</span>
        <h2 id={`adult-heading-${adult.id}`}>{title}</h2>
        {onRemove ? (
          <Button
            aria-label={`Remove adult ${index + 1}`}
            className="adult-response__remove"
            onClick={onRemove}
            variant="quiet"
          >
            Remove
          </Button>
        ) : null}
      </div>

      <FormField
        error={errors?.name}
        id={`adult-name-${adult.id}`}
        label={isRespondent ? "Your name" : `Adult ${index + 1} name`}
        required
      >
        {(fieldProps) => (
          <TextInput
            {...fieldProps}
            autoComplete={isRespondent ? "name" : "off"}
            onChange={(event) => {
              onChange(
                updateAdult(draft, adult.id, (current) => ({
                  ...current,
                  name: event.currentTarget.value
                }))
              );
              onClearError("name");
            }}
            value={adult.name}
          />
        )}
      </FormField>

      <AdultContactFields
        adult={adult}
        contactErrorId={contactErrorId}
        draft={draft}
        errors={errors}
        isRespondent={isRespondent}
        onChange={onChange}
        onClearContactError={onClearContactError}
        onClearError={onClearError}
      />

      <ChoiceGroup
        error={errors?.attendance}
        legend={isRespondent ? "Will you attend?" : `Will ${title} attend?`}
      >
        {attendanceOptions.map((option) => (
          <ChoiceRow
            checked={adult.attendance === option.value}
            id={`attendance-${adult.id}-${option.value}`}
            key={option.value}
            label={option.label}
            name={`attendance-${adult.id}`}
            onChange={() => {
              onChange(
                updateAdult(draft, adult.id, (current) => ({
                  ...current,
                  attendance: option.value
                }))
              );
              onClearError("attendance");
            }}
            value={option.value}
          />
        ))}
      </ChoiceGroup>
    </section>
  );
}

export { AdultAttendanceFields, type AdultAttendanceFieldsProps };
