import type { MouseEventHandler, ReactNode } from "react";

import { QuietLink } from "../components/ui";

type RsvpStepFooterProps = {
  backAction?: ReactNode;
  onHome: MouseEventHandler<HTMLAnchorElement>;
  primaryAction: ReactNode;
};

function RsvpStepFooter({
  backAction,
  onHome,
  primaryAction
}: RsvpStepFooterProps) {
  return (
    <div className="rsvp-step__actions">
      <div className="rsvp-step__secondary-actions">
        <QuietLink href="/" onClick={onHome}>
          Home
        </QuietLink>
        {backAction}
      </div>
      <div className="rsvp-step__primary-action">{primaryAction}</div>
    </div>
  );
}

export { RsvpStepFooter, type RsvpStepFooterProps };
