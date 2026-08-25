import { useState, type FormEvent } from "react";

import { Button, ChoiceGroup, ChoiceRow, FormSection } from "../components/ui";
import { AdultAttendanceFields } from "./AdultAttendanceFields";
import { ChildCountField } from "./ChildCountField";
import { addAdult, removeAdult } from "./rsvpDraft";
import type { GuestSide, RsvpDraft } from "./rsvpTypes";
import {
  validateParty,
  type AdultFieldErrors,
  type PartyFieldErrors
} from "./rsvpValidation";

type AttendanceStepProps = {
  draft: RsvpDraft;
  onBack: () => void;
  onChange: (draft: RsvpDraft) => void;
  onContinue: () => void;
};

const guestSideOptions: readonly { label: string; value: GuestSide }[] = [
  { label: "Niamh's side", value: "niamh" },
  { label: "Brandon's side", value: "brandon" }
];

function hasPartyErrors(errors: PartyFieldErrors) {
  return Boolean(
    errors.guestSide ||
    errors.childrenAttending ||
    Object.keys(errors.adults).length > 0
  );
}

function focusFirstPartyError(errors: PartyFieldErrors, draft: RsvpDraft) {
  if (errors.guestSide) {
    document.getElementById("guest-side-niamh")?.focus();
    return;
  }

  for (const adult of draft.adults) {
    const adultErrors = errors.adults[adult.id];
    if (adultErrors?.name) {
      document.getElementById(`adult-name-${adult.id}`)?.focus();
      return;
    }
    if (adultErrors?.attendance) {
      document.getElementById(`attendance-${adult.id}-attending`)?.focus();
      return;
    }
  }

  if (errors.childrenAttending) {
    document.getElementById("child-count")?.focus();
  }
}

function AttendanceStep({
  draft,
  onBack,
  onChange,
  onContinue
}: AttendanceStepProps) {
  const [errors, setErrors] = useState<PartyFieldErrors>({ adults: {} });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateParty(draft);
    setErrors(nextErrors);

    if (hasPartyErrors(nextErrors)) {
      focusFirstPartyError(nextErrors, draft);
      return;
    }
    onContinue();
  }

  function clearAdultError(adultId: string, field: keyof AdultFieldErrors) {
    setErrors((current) => ({
      ...current,
      adults: {
        ...current.adults,
        [adultId]: { ...current.adults[adultId], [field]: undefined }
      }
    }));
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <FormSection aria-labelledby="attendance-heading" className="rsvp-step">
        <header className="rsvp-step__header">
          <p className="rsvp-step__eyebrow">Tell us about your group</p>
          <h1
            className="rsvp-step__title"
            id="attendance-heading"
            tabIndex={-1}
          >
            Your party &amp; attendance
          </h1>
          <p className="rsvp-step__intro">
            Please include only the people covered by your invitation. If your
            invitation includes a guest, add them below.
          </p>
        </header>

        <ChoiceGroup
          description="This just helps us organize responses. If you know both of us, choose whichever side feels like the better fit."
          error={errors.guestSide}
          legend="Which side of the guest list are you on?"
        >
          {guestSideOptions.map((option) => (
            <ChoiceRow
              checked={draft.guestSide === option.value}
              id={`guest-side-${option.value}`}
              key={option.value}
              label={option.label}
              name="guest-side"
              onChange={() => {
                onChange({ ...draft, guestSide: option.value });
                setErrors((current) => ({
                  ...current,
                  guestSide: undefined
                }));
              }}
              value={option.value}
            />
          ))}
        </ChoiceGroup>

        <div className="attendance-list">
          {draft.adults.map((adult, index) => (
            <AdultAttendanceFields
              adult={adult}
              draft={draft}
              errors={errors.adults[adult.id]}
              index={index}
              key={adult.id}
              onChange={onChange}
              onClearError={(field) => clearAdultError(adult.id, field)}
              onRemove={
                index === 0
                  ? undefined
                  : () => {
                      onChange(removeAdult(draft, adult.id));
                      setErrors((current) => {
                        const nextAdultErrors = { ...current.adults };
                        delete nextAdultErrors[adult.id];
                        return { ...current, adults: nextAdultErrors };
                      });
                    }
              }
            />
          ))}
        </div>

        <Button
          className="attendance-list__add"
          onClick={() => onChange(addAdult(draft))}
          variant="quiet"
        >
          + Add another adult
        </Button>

        <ChildCountField
          draft={draft}
          error={errors.childrenAttending}
          onChange={onChange}
          onClearError={() =>
            setErrors((current) => ({
              ...current,
              childrenAttending: undefined
            }))
          }
        />

        <div className="rsvp-step__actions">
          <Button onClick={onBack} variant="quiet">
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </FormSection>
    </form>
  );
}

export { AttendanceStep, type AttendanceStepProps };
