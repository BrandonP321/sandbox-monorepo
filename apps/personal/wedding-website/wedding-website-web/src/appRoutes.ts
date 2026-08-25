import { useCallback, useEffect, useState, type MouseEvent } from "react";

const LANDING_PATH = "/";
const RSVP_PATH = "/RSVP";

type AppRoute = "landing" | "rsvp";

function routeFromPathname(pathname: string): AppRoute {
  return pathname === RSVP_PATH || pathname === `${RSVP_PATH}/`
    ? "rsvp"
    : "landing";
}

function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>(() =>
    routeFromPathname(window.location.pathname)
  );

  useEffect(() => {
    function handlePopState() {
      setRoute(routeFromPathname(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback(
    (path: typeof LANDING_PATH | typeof RSVP_PATH) => {
      if (window.location.pathname !== path) {
        window.history.pushState(null, "", path);
      }
      setRoute(routeFromPathname(path));
    },
    []
  );

  return { navigate, route };
}

function shouldUseClientNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    event.currentTarget.target !== "_blank"
  );
}

export { LANDING_PATH, RSVP_PATH, shouldUseClientNavigation, useAppRoute };
