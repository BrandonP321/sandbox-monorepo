import { useEffect, useRef, type ReactNode } from "react";

import bowSmall from "../assets/bows/bow-small-01.png";
import catSitting from "../assets/cats/cat-sitting-facing-forward.png";
import floralSprig from "../assets/florals/floral-sprig-01.png";
import floralVine from "../assets/florals/floral-vine-divider.png";
import {
  Button,
  ContentFrame,
  DecorativeLayer,
  FormSection
} from "../components/ui";
import { AdditionalDetailsStep } from "./AdditionalDetailsStep";
import { AttendanceStep } from "./AttendanceStep";
import { prefillPartyContactFromAdults } from "./rsvpDraft";
import type { RsvpDraft, RsvpPrototypeState, RsvpStage } from "./rsvpTypes";

type RSVPPrototypeProps = {
  onBack: () => void;
  onDraftChange: (draft: RsvpDraft) => void;
  onGoTo: (stage: RsvpStage) => void;
  state: RsvpPrototypeState;
};

function RSVPPrototype({
  onBack,
  onDraftChange,
  onGoTo,
  state
}: RSVPPrototypeProps) {
  const previousStage = useRef(state.currentStage);

  useEffect(() => {
    if (previousStage.current === state.currentStage) {
      return;
    }
    previousStage.current = state.currentStage;

    const headingId =
      state.currentStage === "attendance"
        ? "attendance-heading"
        : state.currentStage === "details"
          ? "details-heading"
          : "review-heading";
    document.getElementById(headingId)?.focus();
  }, [state.currentStage]);

  let decorations: ReactNode = null;

  if (state.currentStage === "attendance") {
    decorations = (
      <DecorativeLayer className="prototype-decorations prototype-decorations--attendance">
        <img
          alt=""
          className="prototype-decoration prototype-decoration--cat"
          draggable={false}
          src={catSitting}
        />
        <img
          alt=""
          className="prototype-decoration prototype-decoration--sprig"
          draggable={false}
          src={floralSprig}
        />
        <img
          alt=""
          className="prototype-decoration prototype-decoration--bow"
          draggable={false}
          src={bowSmall}
        />
      </DecorativeLayer>
    );
  } else if (state.currentStage === "details") {
    decorations = (
      <DecorativeLayer className="prototype-decorations prototype-decorations--details">
        <img
          alt=""
          className="prototype-decoration prototype-decoration--vine"
          draggable={false}
          src={floralVine}
        />
      </DecorativeLayer>
    );
  }

  let stageContent: ReactNode;

  if (state.currentStage === "attendance") {
    stageContent = (
      <AttendanceStep
        draft={state.draft}
        onBack={onBack}
        onChange={onDraftChange}
        onContinue={() => {
          onDraftChange(prefillPartyContactFromAdults(state.draft));
          onGoTo("details");
        }}
      />
    );
  } else if (state.currentStage === "details") {
    stageContent = (
      <AdditionalDetailsStep
        draft={state.draft}
        onBack={onBack}
        onChange={onDraftChange}
        onContinue={() => onGoTo("review")}
      />
    );
  } else {
    stageContent = (
      <FormSection
        aria-labelledby="review-heading"
        className="rsvp-step rsvp-step--placeholder"
      >
        <p className="rsvp-step__eyebrow">Almost there</p>
        <h1 className="rsvp-step__title" id="review-heading" tabIndex={-1}>
          Review your RSVP
        </h1>
        <p className="rsvp-step__intro">
          Your answers are ready for the review screen. Review and confirmation
          are completed in the next prototype step.
        </p>
        <div className="rsvp-step__actions">
          <Button onClick={onBack} variant="quiet">
            Back to details
          </Button>
        </div>
      </FormSection>
    );
  }

  return (
    <main className="prototype-page">
      {decorations}
      <ContentFrame className="prototype-page__frame">
        {stageContent}
      </ContentFrame>
    </main>
  );
}

export { RSVPPrototype, type RSVPPrototypeProps };
