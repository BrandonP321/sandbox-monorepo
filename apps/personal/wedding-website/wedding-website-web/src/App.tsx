import { AdminPage } from "./admin/AdminPage";
import { loadRuntimeConfig } from "./config";
import { useAppRoute } from "./appRoutes";
import { GuestExperience } from "./guest/GuestExperience";

type AppProps = {
  onStartRsvp?: () => void;
};

const ignoreStartRsvp = () => undefined;

export default function App({ onStartRsvp = ignoreStartRsvp }: AppProps) {
  const { apiBaseUrl } = loadRuntimeConfig();
  const { location, navigate, route } = useAppRoute();

  if (route === "admin") {
    return <AdminPage apiBaseUrl={apiBaseUrl} />;
  }

  return (
    <GuestExperience
      apiBaseUrl={apiBaseUrl}
      location={location}
      navigate={navigate}
      onStartRsvp={onStartRsvp}
      route={route}
    />
  );
}

export type { AppProps };
