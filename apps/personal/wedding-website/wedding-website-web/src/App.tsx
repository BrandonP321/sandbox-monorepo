import { LandingPage } from "./LandingPage";
import { AdminPage } from "./admin/AdminPage";
import { loadRuntimeConfig } from "./config";
import {
  LANDING_PATH,
  RSVP_PATH,
  shouldUseClientNavigation,
  useAppRoute
} from "./appRoutes";
import { RSVPPrototype } from "./rsvp/RSVPPrototype";
import { useRsvpPrototype } from "./rsvp/rsvpState";

type AppProps = {
  onStartRsvp?: () => void;
};

const ignoreStartRsvp = () => undefined;

export default function App({ onStartRsvp = ignoreStartRsvp }: AppProps) {
  const { apiBaseUrl } = loadRuntimeConfig();
  const { navigate, route } = useAppRoute();

  if (route === "admin") {
    return <AdminPage apiBaseUrl={apiBaseUrl} />;
  }

  return (
    <GuestExperience
      apiBaseUrl={apiBaseUrl}
      navigate={navigate}
      onStartRsvp={onStartRsvp}
      route={route}
    />
  );
}

type GuestExperienceProps = {
  apiBaseUrl: string;
  navigate: ReturnType<typeof useAppRoute>["navigate"];
  onStartRsvp: () => void;
  route: "landing" | "rsvp";
};

function GuestExperience({
  apiBaseUrl,
  navigate,
  onStartRsvp,
  route
}: GuestExperienceProps) {
  const rsvp = useRsvpPrototype({ apiBaseUrl });

  if (route === "landing") {
    return (
      <LandingPage
        onStartRsvp={(event) => {
          onStartRsvp();
          if (shouldUseClientNavigation(event)) {
            event.preventDefault();
            navigate(RSVP_PATH);
          }
        }}
      />
    );
  }

  return (
    <RSVPPrototype
      onBack={rsvp.back}
      onDraftChange={rsvp.replaceDraft}
      onGoTo={rsvp.goTo}
      onHome={(event) => {
        if (shouldUseClientNavigation(event)) {
          event.preventDefault();
          if (rsvp.state.currentStage === "confirmation") {
            rsvp.reset();
          }
          navigate(LANDING_PATH);
        }
      }}
      onSubmit={rsvp.submit}
      state={rsvp.state}
      submissionStatus={rsvp.submissionStatus}
    />
  );
}

export type { AppProps };
