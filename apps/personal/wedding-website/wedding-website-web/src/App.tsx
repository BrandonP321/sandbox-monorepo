import { LandingPage } from "./LandingPage";
import { RSVPPrototype } from "./rsvp/RSVPPrototype";
import { useRsvpPrototype } from "./rsvp/rsvpState";

type AppProps = {
  onStartRsvp?: () => void;
};

const ignoreStartRsvp = () => undefined;

export default function App({ onStartRsvp = ignoreStartRsvp }: AppProps) {
  const rsvp = useRsvpPrototype();

  if (rsvp.state.currentStage === "landing") {
    return (
      <LandingPage
        onStartRsvp={() => {
          rsvp.start();
          onStartRsvp();
        }}
      />
    );
  }

  return (
    <RSVPPrototype
      onBack={rsvp.back}
      onReset={rsvp.reset}
      onSelectFixture={rsvp.selectFixture}
      state={rsvp.state}
    />
  );
}

export type { AppProps };
