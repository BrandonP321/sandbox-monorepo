import { useState, type FormEvent, type MouseEventHandler } from "react";

import { Alert, Button, FormSection } from "../components/ui";
import { getAttendingCount } from "./rsvpDraft";
import { RsvpStepFooter } from "./RsvpStepFooter";
import type { AttendanceStatus, RsvpDraft, RsvpFormStage } from "./rsvpTypes";
import {
  hasDetailsErrors,
  hasPartyErrors,
  validateDetails,
  validateParty
} from "./rsvpValidation";

type RSVPReviewProps = {
  draft: RsvpDraft;
  onBack: () => void;
  onEdit: (stage: RsvpFormStage) => void;
  onHome: MouseEventHandler<HTMLAnchorElement>;
  onSubmit: () => void;
};

const attendanceLabels: Record<AttendanceStatus, string> = {
  attending: "Attending",
  "not-sure": "Not sure yet",
  unable: "Unable to attend"
};

const guestSideLabels = {
  brandon: "Brandon's side",
  niamh: "Niamh's side"
} as const;

function RSVPReview({
  draft,
  onBack,
  onEdit,
  onHome,
  onSubmit
}: RSVPReviewProps) {
  const [invalidStage, setInvalidStage] = useState<RsvpFormStage | null>(null);
  const attendingCount = getAttendingCount(draft);
  const dietaryNotes = draft.dietaryOrAllergyNotes.trim();
  const accessibilityNotes = draft.accessibilityNotes.trim();
  const generalNote = draft.generalNote.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const partyErrors = validateParty(draft);
    const detailsErrors = validateDetails(draft);

    if (hasPartyErrors(partyErrors)) {
      setInvalidStage("attendance");
      return;
    }
    if (hasDetailsErrors(detailsErrors)) {
      setInvalidStage("details");
      return;
    }

    setInvalidStage(null);
    onSubmit();
  }

  const invalidStageLabel =
    invalidStage === "attendance" ? "party & attendance" : "additional details";

  return (
    <form noValidate onSubmit={handleSubmit}>
      <FormSection
        aria-labelledby="review-heading"
        className="rsvp-step review-step"
      >
        <header className="rsvp-step__header">
          <p className="rsvp-step__eyebrow">One last look</p>
          <h1 className="rsvp-step__title" id="review-heading" tabIndex={-1}>
            Review your RSVP
          </h1>
          <p className="rsvp-step__intro">
            Make sure everything looks right before submitting your response.
          </p>
          <time className="rsvp-step__date" dateTime="2027-08-21">
            August 21, 2027
          </time>
        </header>

        <section
          aria-labelledby="review-party-heading"
          className="review-section"
        >
          <div className="review-section__heading">
            <div>
              <p className="review-section__eyebrow">Your response</p>
              <h2 id="review-party-heading">Party &amp; attendance</h2>
            </div>
            <div className="review-attending-count">
              <span className="review-attending-count__value">
                {attendingCount}
              </span>
              <span className="review-attending-count__label">
                {attendingCount === 1 ? "guest attending" : "guests attending"}
              </span>
            </div>
          </div>

          <dl className="review-facts">
            <div>
              <dt>Guest list side</dt>
              <dd>
                {draft.guestSide
                  ? guestSideLabels[draft.guestSide]
                  : "Not selected"}
              </dd>
            </div>
            <div>
              <dt>Children attending</dt>
              <dd>{draft.childrenAttending}</dd>
            </div>
          </dl>

          <ol className="review-adult-list">
            {draft.adults.map((adult) => (
              <li key={adult.id}>
                <div className="review-adult-list__summary">
                  <span className="review-adult-list__name">
                    {adult.name.trim() || "Name missing"}
                  </span>
                  <span className="review-adult-list__status">
                    {adult.attendance
                      ? attendanceLabels[adult.attendance]
                      : "Attendance not selected"}
                  </span>
                </div>
                {adult.contact.email.trim() || adult.contact.phone.trim() ? (
                  <dl className="review-adult-list__contact">
                    {adult.contact.email.trim() ? (
                      <div>
                        <dt>Email</dt>
                        <dd>{adult.contact.email.trim()}</dd>
                      </div>
                    ) : null}
                    {adult.contact.phone.trim() ? (
                      <div>
                        <dt>Phone</dt>
                        <dd>{adult.contact.phone.trim()}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="review-contact-heading"
          className="review-section"
        >
          <div className="review-section__heading">
            <div>
              <p className="review-section__eyebrow">How to reach you</p>
              <h2 id="review-contact-heading">Contact details</h2>
            </div>
          </div>
          <dl className="review-facts">
            {draft.contact.email.trim() ? (
              <div>
                <dt>Email</dt>
                <dd>{draft.contact.email.trim()}</dd>
              </div>
            ) : null}
            {draft.contact.phone.trim() ? (
              <div>
                <dt>Phone</dt>
                <dd>{draft.contact.phone.trim()}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        {dietaryNotes || accessibilityNotes || generalNote ? (
          <section
            aria-labelledby="review-notes-heading"
            className="review-section"
          >
            <div className="review-section__heading">
              <div>
                <p className="review-section__eyebrow">Anything else</p>
                <h2 id="review-notes-heading">Notes</h2>
              </div>
            </div>
            <dl className="review-notes">
              {dietaryNotes ? (
                <div>
                  <dt>Dietary restrictions or allergies</dt>
                  <dd>{dietaryNotes}</dd>
                </div>
              ) : null}
              {accessibilityNotes ? (
                <div>
                  <dt>Accessibility or accommodations</dt>
                  <dd>{accessibilityNotes}</dd>
                </div>
              ) : null}
              {generalNote ? (
                <div>
                  <dt>General note</dt>
                  <dd>{generalNote}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}

        {invalidStage ? (
          <Alert
            className="review-validation"
            title="A few answers need attention"
          >
            <p>
              Return to {invalidStageLabel} and complete the required answers
              before submitting.
            </p>
            <Button
              className="review-validation__action"
              onClick={() => onEdit(invalidStage)}
              variant="quiet"
            >
              Edit {invalidStageLabel}
            </Button>
          </Alert>
        ) : null}

        <RsvpStepFooter
          backAction={
            <Button onClick={onBack} variant="quiet">
              Back to details
            </Button>
          }
          onHome={onHome}
          primaryAction={<Button type="submit">Submit RSVP</Button>}
        />
      </FormSection>
    </form>
  );
}

export { RSVPReview, type RSVPReviewProps };
