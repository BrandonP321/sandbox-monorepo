import { type MouseEvent } from "react";

import {
  guestDestinations,
  type GuestDestination,
  type GuestRoute
} from "../appRoutes";
import { useNavigationDisclosure } from "./useNavigationDisclosure";

const navigationPanelId = "guest-navigation-panel";

type GuestNavigationProps = {
  guestPageNavigationDisabled: boolean;
  navigationRevision: number;
  onNavigate: (
    event: MouseEvent<HTMLAnchorElement>,
    destination: GuestDestination
  ) => void;
  route: GuestRoute;
};

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="site-header__toggle-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="site-header__toggle-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="m4 4 16 16M20 4 4 20" />
    </svg>
  );
}

function GuestNavigation({
  guestPageNavigationDisabled,
  navigationRevision,
  onNavigate,
  route
}: GuestNavigationProps) {
  const [home, faq, registry, rsvp] = guestDestinations;
  const {
    brandRef,
    closeMenu,
    desktopHomeRef,
    desktopFaqRef,
    desktopRegistryRef,
    handleHeaderKeyDown,
    headerRef,
    isDesktop,
    isMenuOpen,
    rsvpRef,
    toggleMenu,
    toggleRef
  } = useNavigationDisclosure(navigationRevision);

  function handleDestinationActivation(
    event: MouseEvent<HTMLAnchorElement>,
    destination: GuestDestination
  ) {
    if (destination.route !== "rsvp" && guestPageNavigationDisabled) {
      event.preventDefault();
      return;
    }

    closeMenu();
    onNavigate(event, destination);
  }

  const guestPageDisabledProps = guestPageNavigationDisabled
    ? ({ "aria-disabled": true, tabIndex: -1 } as const)
    : {};

  return (
    <header
      className="site-header"
      onKeyDown={handleHeaderKeyDown}
      ref={headerRef}
    >
      <nav aria-label="Main navigation" className="site-navigation">
        <div className="site-header__bar">
          <div className="site-header__inner">
            <a
              {...guestPageDisabledProps}
              aria-label={isDesktop ? "Niamh & Brandon" : "N&B"}
              className="site-header__brand"
              data-destination="landing"
              href={home.path}
              onClick={(event) => handleDestinationActivation(event, home)}
              ref={brandRef}
            >
              {isDesktop ? (
                <>
                  Niamh <span className="site-header__ampersand">&amp;</span>{" "}
                  Brandon
                </>
              ) : (
                <>
                  N<span className="site-header__ampersand">&amp;</span>B
                </>
              )}
            </a>

            {isDesktop ? (
              <ul className="site-header__desktop-links">
                <li>
                  <a
                    {...guestPageDisabledProps}
                    aria-current={route === home.route ? "page" : undefined}
                    className="site-header__link"
                    data-destination="landing"
                    href={home.path}
                    onClick={(event) =>
                      handleDestinationActivation(event, home)
                    }
                    ref={desktopHomeRef}
                  >
                    {home.label}
                  </a>
                </li>
                <li>
                  <a
                    {...guestPageDisabledProps}
                    aria-current={route === faq.route ? "page" : undefined}
                    className="site-header__link"
                    data-destination="faq"
                    href={faq.path}
                    onClick={(event) => handleDestinationActivation(event, faq)}
                    ref={desktopFaqRef}
                  >
                    {faq.label}
                  </a>
                </li>
                <li>
                  <a
                    {...guestPageDisabledProps}
                    aria-current={route === registry.route ? "page" : undefined}
                    className="site-header__link"
                    data-destination="registry"
                    href={registry.path}
                    onClick={(event) =>
                      handleDestinationActivation(event, registry)
                    }
                    ref={desktopRegistryRef}
                  >
                    {registry.label}
                  </a>
                </li>
                <li>
                  <a
                    aria-current={route === rsvp.route ? "page" : undefined}
                    className="site-header__rsvp"
                    data-appearance={
                      route === rsvp.route ? "current" : "action"
                    }
                    data-destination="rsvp"
                    href={rsvp.path}
                    onClick={(event) =>
                      handleDestinationActivation(event, rsvp)
                    }
                    ref={rsvpRef}
                  >
                    {rsvp.label}
                  </a>
                </li>
              </ul>
            ) : (
              <div className="site-header__mobile-controls">
                <a
                  aria-current={route === rsvp.route ? "page" : undefined}
                  className="site-header__rsvp"
                  data-appearance={route === rsvp.route ? "current" : "action"}
                  data-destination="rsvp"
                  href={rsvp.path}
                  onClick={(event) => handleDestinationActivation(event, rsvp)}
                  ref={rsvpRef}
                >
                  {rsvp.label}
                </a>
                <button
                  aria-controls={navigationPanelId}
                  aria-expanded={isMenuOpen}
                  aria-label={
                    isMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                  }
                  className="site-header__toggle"
                  onClick={toggleMenu}
                  ref={toggleRef}
                  type="button"
                >
                  {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            )}
          </div>
        </div>

        {!isDesktop ? (
          <div
            className="site-header__panel"
            hidden={!isMenuOpen}
            id={navigationPanelId}
          >
            <div className="site-header__panel-inner">
              <ul className="site-header__panel-links">
                <li>
                  <a
                    {...guestPageDisabledProps}
                    aria-current={route === home.route ? "page" : undefined}
                    className="site-header__panel-link"
                    data-destination="landing"
                    href={home.path}
                    onClick={(event) =>
                      handleDestinationActivation(event, home)
                    }
                  >
                    {home.label}
                  </a>
                </li>
                <li>
                  <a
                    {...guestPageDisabledProps}
                    aria-current={route === faq.route ? "page" : undefined}
                    className="site-header__panel-link"
                    data-destination="faq"
                    href={faq.path}
                    onClick={(event) => handleDestinationActivation(event, faq)}
                  >
                    {faq.label}
                  </a>
                </li>
                <li>
                  <a
                    {...guestPageDisabledProps}
                    aria-current={route === registry.route ? "page" : undefined}
                    className="site-header__panel-link"
                    data-destination="registry"
                    href={registry.path}
                    onClick={(event) =>
                      handleDestinationActivation(event, registry)
                    }
                  >
                    {registry.label}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}

export { GuestNavigation, type GuestNavigationProps };
