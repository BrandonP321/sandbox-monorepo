import { useEffect, useRef, type MouseEvent } from "react";

import { LandingPage } from "../LandingPage";
import {
  type GuestDestination,
  type GuestRoute,
  homeDestination,
  rsvpDestination,
  shouldUseClientNavigation,
  useAppRoute
} from "../appRoutes";
import { RSVPPrototype } from "../rsvp/RSVPPrototype";
import { useRsvpPrototype } from "../rsvp/rsvpState";
import { RegistryPage } from "../registry/RegistryPage";
import { GuestShell } from "./GuestShell";

type GuestExperienceProps = {
  apiBaseUrl: string;
  location: ReturnType<typeof useAppRoute>["location"];
  navigate: ReturnType<typeof useAppRoute>["navigate"];
  onStartRsvp: () => void;
  route: GuestRoute;
};

function GuestExperience({
  apiBaseUrl,
  location,
  navigate,
  onStartRsvp,
  route
}: GuestExperienceProps) {
  const rsvp = useRsvpPrototype({ apiBaseUrl });
  const resetRsvpRef = useRef(rsvp.reset);
  const confirmationWasDisplayed = useRef(false);
  const guestPageNavigationDisabled =
    route === "rsvp" && rsvp.submissionStatus.state === "submitting";

  resetRsvpRef.current = rsvp.reset;

  useEffect(() => {
    if (route === "rsvp" && rsvp.state.currentStage === "confirmation") {
      confirmationWasDisplayed.current = true;
      return;
    }

    if (
      route !== "rsvp" &&
      rsvp.state.currentStage === "confirmation" &&
      confirmationWasDisplayed.current
    ) {
      confirmationWasDisplayed.current = false;
      resetRsvpRef.current();
      return;
    }

    if (rsvp.state.currentStage !== "confirmation") {
      confirmationWasDisplayed.current = false;
    }
  }, [route, rsvp.state.currentStage]);

  function handleGuestNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    destination: GuestDestination
  ) {
    if (guestPageNavigationDisabled && destination.route !== "rsvp") {
      event.preventDefault();
      return;
    }

    if (destination.route === "rsvp" && route === "landing") {
      onStartRsvp();
    }

    if (!shouldUseClientNavigation(event)) {
      return;
    }

    event.preventDefault();
    if (destination.route === route) {
      return;
    }

    if (
      destination.route !== "rsvp" &&
      rsvp.state.currentStage === "confirmation"
    ) {
      rsvp.reset();
    }
    navigate(destination.path);
  }

  return (
    <GuestShell
      guestPageNavigationDisabled={guestPageNavigationDisabled}
      location={location}
      onNavigate={handleGuestNavigation}
      route={route}
    >
      {route === "landing" ? (
        <LandingPage
          onStartRsvp={(event) => handleGuestNavigation(event, rsvpDestination)}
        />
      ) : route === "registry" ? (
        <RegistryPage />
      ) : (
        <RSVPPrototype
          onBack={rsvp.back}
          onDraftChange={rsvp.replaceDraft}
          onGoTo={rsvp.goTo}
          onHome={(event) => handleGuestNavigation(event, homeDestination)}
          onSubmit={rsvp.submit}
          state={rsvp.state}
          submissionStatus={rsvp.submissionStatus}
        />
      )}
    </GuestShell>
  );
}

export { GuestExperience, type GuestExperienceProps };
