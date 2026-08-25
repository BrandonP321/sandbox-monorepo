import { useState, type FormEvent, type MouseEventHandler } from "react";

import { Button, FormSection } from "../components/ui";
import { ContactFields } from "./ContactFields";
import { PartyNotesFields } from "./PartyNotesFields";
import { RsvpStepFooter } from "./RsvpStepFooter";
import type { RsvpDraft } from "./rsvpTypes";
import { validateDetails, type DetailsFieldErrors } from "./rsvpValidation";

type AdditionalDetailsStepProps = {
  draft: RsvpDraft;
  onBack: () => void;
  onChange: (draft: RsvpDraft) => void;
  onContinue: () => void;
  onHome: MouseEventHandler<HTMLAnchorElement>;
};
function focusFirstDetailsError(errors: DetailsFieldErrors) {
  if (errors.contact || errors.email) {
    document.getElementById("email")?.focus();
  } else if (errors.phone) {
    document.getElementById("phone")?.focus();
  }
}

function AdditionalDetailsStep({
  draft,
  onBack,
  onChange,
  onContinue,
  onHome
}: AdditionalDetailsStepProps) {
  const [errors, setErrors] = useState<DetailsFieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateDetails(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstDetailsError(nextErrors);
      return;
    }
    onContinue();
  }

  function clearError(field: keyof DetailsFieldErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <FormSection aria-labelledby="details-heading" className="rsvp-step">
        <header className="rsvp-step__header">
          <p className="rsvp-step__eyebrow">A few final details</p>
          <h1 className="rsvp-step__title" id="details-heading" tabIndex={-1}>
            Additional details
          </h1>
          <p className="rsvp-step__intro">
            Share the best way to reach your party and anything that will help
            everyone feel comfortable at the celebration.
          </p>
        </header>

        <div className="details-fields">
          <ContactFields
            draft={draft}
            errors={errors}
            onChange={onChange}
            onClearError={clearError}
          />
          <PartyNotesFields draft={draft} onChange={onChange} />
        </div>

        <RsvpStepFooter
          backAction={
            <Button onClick={onBack} variant="quiet">
              Back
            </Button>
          }
          onHome={onHome}
          primaryAction={<Button type="submit">Continue to review</Button>}
        />
      </FormSection>
    </form>
  );
}

export { AdditionalDetailsStep, type AdditionalDetailsStepProps };
