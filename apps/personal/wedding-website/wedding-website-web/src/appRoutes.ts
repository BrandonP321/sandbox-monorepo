import { useCallback, useEffect, useState, type MouseEvent } from "react";

const LANDING_PATH = "/";
const RSVP_PATH = "/RSVP";
const WEDDING_DAY_PATH = "/wedding-day";
const FAQ_PATH = "/faq";
const REGISTRY_PATH = "/registry";
const ADMIN_PATH = "/admin";

type GuestRoute = "faq" | "landing" | "registry" | "rsvp" | "weddingDay";
type AppRoute = "admin" | GuestRoute;
type GuestPath =
  | typeof FAQ_PATH
  | typeof LANDING_PATH
  | typeof REGISTRY_PATH
  | typeof RSVP_PATH
  | typeof WEDDING_DAY_PATH;
type RouteNavigationSource = "explicit" | "history" | "initial";

type GuestDestination = {
  label: "FAQ" | "Home" | "Registry & Gifts" | "RSVP" | "Wedding Day";
  path: GuestPath;
  route: GuestRoute;
};

type AppLocation = {
  revision: number;
  route: AppRoute;
  source: RouteNavigationSource;
};

const guestDestinations = [
  { label: "Home", path: LANDING_PATH, route: "landing" },
  {
    label: "Wedding Day",
    path: WEDDING_DAY_PATH,
    route: "weddingDay"
  },
  { label: "FAQ", path: FAQ_PATH, route: "faq" },
  {
    label: "Registry & Gifts",
    path: REGISTRY_PATH,
    route: "registry"
  },
  { label: "RSVP", path: RSVP_PATH, route: "rsvp" }
] as const satisfies readonly GuestDestination[];

const [
  homeDestination,
  weddingDayDestination,
  faqDestination,
  registryDestination,
  rsvpDestination
] = guestDestinations;

function routeFromPathname(pathname: string): AppRoute {
  if (pathname === ADMIN_PATH || pathname === `${ADMIN_PATH}/`) {
    return "admin";
  }
  if (pathname === WEDDING_DAY_PATH || pathname === `${WEDDING_DAY_PATH}/`) {
    return "weddingDay";
  }
  if (pathname === FAQ_PATH || pathname === `${FAQ_PATH}/`) {
    return "faq";
  }
  if (pathname === REGISTRY_PATH || pathname === `${REGISTRY_PATH}/`) {
    return "registry";
  }
  return pathname === RSVP_PATH || pathname === `${RSVP_PATH}/`
    ? "rsvp"
    : "landing";
}

function useAppRoute() {
  const [location, setLocation] = useState<AppLocation>(() => ({
    revision: 0,
    route: routeFromPathname(window.location.pathname),
    source: "initial"
  }));

  useEffect(() => {
    function handlePopState() {
      setLocation((currentLocation) => ({
        revision: currentLocation.revision + 1,
        route: routeFromPathname(window.location.pathname),
        source: "history"
      }));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path: GuestPath) => {
    const nextRoute = routeFromPathname(path);

    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }

    setLocation((currentLocation) => {
      if (currentLocation.route === nextRoute) {
        return currentLocation;
      }

      return {
        revision: currentLocation.revision + 1,
        route: nextRoute,
        source: "explicit"
      };
    });
  }, []);

  return { location, navigate, route: location.route };
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

export {
  ADMIN_PATH,
  FAQ_PATH,
  type AppRoute,
  type GuestDestination,
  type GuestPath,
  type GuestRoute,
  LANDING_PATH,
  REGISTRY_PATH,
  RSVP_PATH,
  WEDDING_DAY_PATH,
  faqDestination,
  guestDestinations,
  homeDestination,
  registryDestination,
  rsvpDestination,
  shouldUseClientNavigation,
  useAppRoute,
  weddingDayDestination
};
