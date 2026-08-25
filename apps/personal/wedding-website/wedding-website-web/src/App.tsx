import { LandingPage } from "./LandingPage";

type AppProps = {
  onStartRsvp?: () => void;
};

const ignoreStartRsvp = () => undefined;

export default function App({ onStartRsvp = ignoreStartRsvp }: AppProps) {
  return <LandingPage onStartRsvp={onStartRsvp} />;
}

export type { AppProps };
