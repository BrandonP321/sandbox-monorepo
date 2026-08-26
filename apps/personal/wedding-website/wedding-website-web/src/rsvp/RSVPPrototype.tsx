import {
  useEffect,
  useRef,
  type MouseEventHandler,
  type ReactNode
} from "react";

import { ContentFrame } from "../components/ui";
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
      <ContentFrame className="prototype-page__frame">
        {stageContent}
      </ContentFrame>
    </main>
  );
}

export { RSVPPrototype, type RSVPPrototypeProps };
