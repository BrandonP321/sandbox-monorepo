import { LandingPage } from "./LandingPage";
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
  const rsvp = useRsvpPrototype();
  const { navigate, route } = useAppRoute();

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
      onBack={
        rsvp.state.currentStage === "attendance"
          ? () => navigate(LANDING_PATH)
          : rsvp.back
      }
      onDraftChange={rsvp.replaceDraft}
      onGoTo={rsvp.goTo}
      state={rsvp.state}
    />
  );
}

export type { AppProps };
