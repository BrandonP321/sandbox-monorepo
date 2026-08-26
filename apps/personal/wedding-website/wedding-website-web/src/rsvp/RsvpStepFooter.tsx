import type { MouseEventHandler, ReactNode } from "react";

import { QuietLink } from "../components/ui";

type RsvpStepFooterProps = {
  backAction?: ReactNode;
  homeDisabled?: boolean;
  onHome: MouseEventHandler<HTMLAnchorElement>;
  primaryAction: ReactNode;
};

function RsvpStepFooter({
  backAction,
  homeDisabled = false,
  onHome,
  primaryAction
}: RsvpStepFooterProps) {
  return (
    <div className="rsvp-step__actions">
      <div className="rsvp-step__secondary-actions">
        <QuietLink
          aria-disabled={homeDisabled || undefined}
          href="/"
          onClick={(event) => {
            if (homeDisabled) {
              event.preventDefault();
              return;
            }
            onHome(event);
          }}
          tabIndex={homeDisabled ? -1 : undefined}
        >
          Home
        </QuietLink>
        {backAction}
      </div>
      <div className="rsvp-step__primary-action">{primaryAction}</div>
    </div>
  );
}

export { RsvpStepFooter, type RsvpStepFooterProps };
