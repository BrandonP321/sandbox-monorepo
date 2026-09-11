import { useEffect, type MouseEvent, type ReactNode } from "react";

import type { GuestDestination, GuestRoute, useAppRoute } from "../appRoutes";
import { GuestNavigation } from "./GuestNavigation";

type GuestShellProps = {
  children: ReactNode;
  guestPageNavigationDisabled: boolean;
  location: ReturnType<typeof useAppRoute>["location"];
  onNavigate: (
    event: MouseEvent<HTMLAnchorElement>,
    destination: GuestDestination
  ) => void;
  route: GuestRoute;
};

function GuestShell({
  children,
  guestPageNavigationDisabled,
  location,
  onNavigate,
  route
}: GuestShellProps) {
  useEffect(() => {
    if (location.source !== "explicit") {
      return;
    }

    const mainContent = document.getElementById("main-content");
    mainContent?.focus({ preventScroll: true });
    window.scrollTo({ behavior: "auto", left: 0, top: 0 });
  }, [location.revision, location.source]);

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <GuestNavigation
        guestPageNavigationDisabled={guestPageNavigationDisabled}
        navigationRevision={location.revision}
        onNavigate={onNavigate}
        route={route}
      />
      {children}
    </>
  );
}

export { GuestShell, type GuestShellProps };
