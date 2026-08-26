import type { MouseEventHandler } from "react";

import { FormSection, PrimaryLink } from "../components/ui";

type RSVPConfirmationProps = {
  onHome: MouseEventHandler<HTMLAnchorElement>;
};

function RSVPConfirmation({ onHome }: RSVPConfirmationProps) {
  return (
    <FormSection
      aria-labelledby="confirmation-heading"
      className="rsvp-step confirmation-step"
    >
      <header className="rsvp-step__header confirmation-step__header">
        <p className="rsvp-step__eyebrow">All set</p>
        <h1
          className="rsvp-step__title"
          id="confirmation-heading"
          tabIndex={-1}
        >
          Thank you—your RSVP is complete.
        </h1>
        <p className="rsvp-step__intro">
          Thank you for taking a moment to let us know your plans.
        </p>
        <p className="rsvp-step__intro confirmation-step__guidance">
          If your plans change or you need to correct something, you can submit
          another RSVP or reach out to us directly.
        </p>
      </header>

      <div className="confirmation-step__actions">
        <PrimaryLink
          className="confirmation-step__home"
          href="/"
          onClick={onHome}
        >
          Home
        </PrimaryLink>
      </div>
    </FormSection>
  );
}

export { RSVPConfirmation, type RSVPConfirmationProps };
