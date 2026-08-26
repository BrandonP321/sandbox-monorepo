import {
  useEffect,
  useRef,
  type MouseEventHandler,
  type ReactNode
} from "react";

import {
  ContentFrame,
  DecorativeLayer,
  ProgressiveImage
} from "../components/ui";
import { weddingImageAssets } from "../weddingImageAssets";
import { AdditionalDetailsStep } from "./AdditionalDetailsStep";
import { AttendanceStep } from "./AttendanceStep";
import { RSVPConfirmation } from "./RSVPConfirmation";
import { RSVPReview } from "./RSVPReview";
import { prefillPartyContactFromAdults } from "./rsvpDraft";
import type {
  RsvpDraft,
  RsvpFormStage,
  RsvpPrototypeState,
  RsvpSubmissionStatus,
  RsvpStage
} from "./rsvpTypes";

type RSVPPrototypeProps = {
  onBack: () => void;
  onDraftChange: (draft: RsvpDraft) => void;
  onGoTo: (stage: RsvpFormStage) => void;
  onHome: MouseEventHandler<HTMLAnchorElement>;
  onSubmit: () => Promise<void>;
  state: RsvpPrototypeState;
  submissionStatus: RsvpSubmissionStatus;
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
  state,
  submissionStatus
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
        <ProgressiveImage
          {...weddingImageAssets.catSitting}
          alt=""
          className="prototype-decoration prototype-decoration--cat"
          draggable={false}
        />
        <ProgressiveImage
          {...weddingImageAssets.floralSprig}
          alt=""
          className="prototype-decoration prototype-decoration--sprig"
          draggable={false}
        />
        <ProgressiveImage
          {...weddingImageAssets.bowSmall}
          alt=""
          className="prototype-decoration prototype-decoration--bow"
          draggable={false}
        />
      </DecorativeLayer>
    );
  } else if (state.currentStage === "details") {
    decorations = (
      <DecorativeLayer className="prototype-decorations prototype-decorations--details">
        <ProgressiveImage
          {...weddingImageAssets.floralVine}
          alt=""
          className="prototype-decoration prototype-decoration--vine"
          draggable={false}
        />
      </DecorativeLayer>
    );
  } else if (state.currentStage === "review") {
    decorations = (
      <DecorativeLayer className="prototype-decorations prototype-decorations--review">
        <ProgressiveImage
          {...weddingImageAssets.floralVine}
          alt=""
          className="prototype-decoration prototype-decoration--review-vine"
          draggable={false}
        />
        <ProgressiveImage
          {...weddingImageAssets.sparklesPrimary}
          alt=""
          className="prototype-decoration prototype-decoration--review-sparkles"
          draggable={false}
        />
      </DecorativeLayer>
    );
  } else {
    decorations = (
      <DecorativeLayer className="prototype-decorations prototype-decorations--confirmation">
        <ProgressiveImage
          {...weddingImageAssets.catSitting}
          alt=""
          className="prototype-decoration prototype-decoration--confirmation-cat"
          draggable={false}
        />
        <ProgressiveImage
          {...weddingImageAssets.champagneGlasses}
          alt=""
          className="prototype-decoration prototype-decoration--confirmation-champagne"
          draggable={false}
        />
        <ProgressiveImage
          {...weddingImageAssets.discoBall}
          alt=""
          className="prototype-decoration prototype-decoration--confirmation-disco"
          draggable={false}
        />
        <ProgressiveImage
          {...weddingImageAssets.sparklesSecondary}
          alt=""
          className="prototype-decoration prototype-decoration--confirmation-sparkles"
          draggable={false}
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
        submissionStatus={submissionStatus}
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
