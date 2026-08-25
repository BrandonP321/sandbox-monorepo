import {
  useEffect,
  useRef,
  type MouseEventHandler,
  type ReactNode
} from "react";

import bowSmall from "../assets/bows/bow-small-01.png";
import sparklesPrimary from "../assets/accents/sparkles-01.png";
import sparklesSecondary from "../assets/accents/sparkles-03.png";
import catSitting from "../assets/cats/cat-sitting-facing-forward.png";
import champagneGlasses from "../assets/celebration/champagne-glasses-01.png";
import discoBall from "../assets/celebration/disco-ball-01.png";
import floralSprig from "../assets/florals/floral-sprig-01.png";
import floralVine from "../assets/florals/floral-vine-divider.png";
import { ContentFrame, DecorativeLayer } from "../components/ui";
import { AdditionalDetailsStep } from "./AdditionalDetailsStep";
import { AttendanceStep } from "./AttendanceStep";
import { RSVPConfirmation } from "./RSVPConfirmation";
import { RSVPReview } from "./RSVPReview";
import { prefillPartyContactFromAdults } from "./rsvpDraft";
import type {
  RsvpDraft,
  RsvpFormStage,
  RsvpPrototypeState,
  RsvpStage
} from "./rsvpTypes";

type RSVPPrototypeProps = {
  onBack: () => void;
  onDraftChange: (draft: RsvpDraft) => void;
  onGoTo: (stage: RsvpFormStage) => void;
  onHome: MouseEventHandler<HTMLAnchorElement>;
  onSubmit: () => void;
  state: RsvpPrototypeState;
};

const stageHeadingIds: Record<RsvpStage, string> = {
  attendance: "attendance-heading",
  confirmation: "confirmation-heading",
  details: "details-heading",
  review: "review-heading"
};

function RSVPPrototype({
  onBack,
  onDraftChange,
  onGoTo,
  onHome,
  onSubmit,
  state
}: RSVPPrototypeProps) {
  const previousStage = useRef(state.currentStage);

  useEffect(() => {
    if (previousStage.current === state.currentStage) {
      return;
    }
    previousStage.current = state.currentStage;

    document.getElementById(stageHeadingIds[state.currentStage])?.focus();
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
  } else if (state.currentStage === "review") {
    decorations = (
      <DecorativeLayer className="prototype-decorations prototype-decorations--review">
        <img
          alt=""
          className="prototype-decoration prototype-decoration--review-vine"
          draggable={false}
          src={floralVine}
        />
        <img
          alt=""
          className="prototype-decoration prototype-decoration--review-sparkles"
          draggable={false}
          src={sparklesPrimary}
        />
      </DecorativeLayer>
    );
  } else {
    decorations = (
      <DecorativeLayer className="prototype-decorations prototype-decorations--confirmation">
        <img
          alt=""
          className="prototype-decoration prototype-decoration--confirmation-cat"
          draggable={false}
          src={catSitting}
        />
        <img
          alt=""
          className="prototype-decoration prototype-decoration--confirmation-champagne"
          draggable={false}
          src={champagneGlasses}
        />
        <img
          alt=""
          className="prototype-decoration prototype-decoration--confirmation-disco"
          draggable={false}
          src={discoBall}
        />
        <img
          alt=""
          className="prototype-decoration prototype-decoration--confirmation-sparkles"
          draggable={false}
          src={sparklesSecondary}
        />
      </DecorativeLayer>
    );
  }

  let stageContent: ReactNode;

  if (state.currentStage === "attendance") {
    stageContent = (
      <AttendanceStep
        draft={state.draft}
        onChange={onDraftChange}
        onContinue={() => {
          onDraftChange(prefillPartyContactFromAdults(state.draft));
          onGoTo("details");
        }}
        onHome={onHome}
      />
    );
  } else if (state.currentStage === "details") {
    stageContent = (
      <AdditionalDetailsStep
        draft={state.draft}
        onBack={onBack}
        onChange={onDraftChange}
        onContinue={() => onGoTo("review")}
        onHome={onHome}
      />
    );
  } else if (state.currentStage === "review") {
    stageContent = (
      <RSVPReview
        draft={state.draft}
        onBack={onBack}
        onEdit={onGoTo}
        onHome={onHome}
        onSubmit={onSubmit}
      />
    );
  } else {
    stageContent = <RSVPConfirmation onHome={onHome} />;
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
