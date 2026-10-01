import type { MouseEvent } from "react";
import { AdminPage } from "./admin/AdminPage";
import { LandingPage } from "./LandingPage";
import { FaqPage } from "./faq/FaqPage";
import { RegistryPage } from "./registry/RegistryPage";
import { WeddingDayPage } from "./weddingDay/WeddingDayPage";
import { GuestShell } from "./guest/GuestShell";
import {
  useAppRoute,
  shouldUseClientNavigation,
  rsvpDestination,
  type GuestDestination
} from "./appRoutes";

// Reuse normal website pages, but never mount the live RSVP submission flow.
export function PreviewApp() {
  const { route, location, navigate } = useAppRoute();
  function onNavigate(
    event: MouseEvent<HTMLAnchorElement>,
    destination: GuestDestination
  ) {
    if (!shouldUseClientNavigation(event)) return;
    event.preventDefault();
    navigate(destination.path);
  }
  return (
    <>
      <aside aria-label="Preview notice">
        Public preview · RSVP submissions disabled.
      </aside>
      {route === "admin" ? (
        <AdminPage apiBaseUrl="/api" />
      ) : (
        <GuestShell
          route={route}
          location={location}
          onNavigate={onNavigate}
          guestPageNavigationDisabled={false}
        >
          {route === "landing" ? (
            <LandingPage
              onStartRsvp={(event) => onNavigate(event, rsvpDestination)}
            />
          ) : route === "faq" ? (
            <FaqPage onNavigate={onNavigate} />
          ) : route === "registry" ? (
            <RegistryPage />
          ) : route === "weddingDay" ? (
            <WeddingDayPage />
          ) : (
            <section>
              <h1>RSVP preview</h1>
              <p>
                RSVP submissions are disabled in this preview. No information
                entered here is sent to the wedding RSVP service.
              </p>
            </section>
          )}
        </GuestShell>
      )}
    </>
  );
}
