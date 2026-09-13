import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import { GuestNavigation } from "./GuestNavigation";

const desktopNavigationQuery = "(min-width: 64rem)";
const navigationPanelId = "guest-navigation-panel";

type MatchMediaController = {
  setMatches: (matches: boolean) => void;
};

function installMatchMedia(initialMatches: boolean): MatchMediaController {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    addEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject
    ) => {
      if (type === "change" && typeof listener === "function") {
        listeners.add(listener as (event: MediaQueryListEvent) => void);
      }
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    dispatchEvent: () => true,
    get matches() {
      return matches;
    },
    media: desktopNavigationQuery,
    onchange: null,
    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject
    ) => {
      if (type === "change" && typeof listener === "function") {
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      }
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    }
  } as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQueryList)
  );

  return {
    setMatches(nextMatches) {
      matches = nextMatches;
      const event = {
        matches: nextMatches,
        media: desktopNavigationQuery
      } as MediaQueryListEvent;
      act(() => listeners.forEach((listener) => listener(event)));
    }
  };
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("guest navigation", () => {
  it("locks every non-RSVP destination while an RSVP submission is pending", () => {
    installMatchMedia(true);
    const onNavigate = vi.fn();

    render(
      <GuestNavigation
        guestPageNavigationDisabled
        navigationRevision={0}
        onNavigate={onNavigate}
        route="rsvp"
      />
    );

    const navigation = screen.getByRole("navigation", {
      name: "Main navigation"
    });
    const homeLink = within(navigation).getByRole("link", { name: "Home" });
    const weddingDayLink = within(navigation).getByRole("link", {
      name: "Wedding Day"
    });
    const registryLink = within(navigation).getByRole("link", {
      name: "Registry & Gifts"
    });
    const faqLink = within(navigation).getByRole("link", { name: "FAQ" });

    expect(homeLink).toHaveAttribute("aria-disabled", "true");
    expect(weddingDayLink).toHaveAttribute("aria-disabled", "true");
    expect(faqLink).toHaveAttribute("aria-disabled", "true");
    expect(registryLink).toHaveAttribute("aria-disabled", "true");
    expect(homeLink).toHaveAttribute("tabindex", "-1");
    expect(weddingDayLink).toHaveAttribute("tabindex", "-1");
    expect(faqLink).toHaveAttribute("tabindex", "-1");
    expect(registryLink).toHaveAttribute("tabindex", "-1");

    fireEvent.click(faqLink);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("renders the desktop guest information architecture with current-page state", async () => {
    installMatchMedia(true);
    const scrollTo = vi.spyOn(window, "scrollTo");
    render(<App />);

    const banner = screen.getByRole("banner");
    const navigation = within(banner).getByRole("navigation", {
      name: "Main navigation"
    });
    const navigationLinks = within(navigation).getAllByRole("link");

    expect(document.querySelector("a")).toBe(
      screen.getByRole("link", { name: "Skip to content" })
    );
    fireEvent.click(screen.getByRole("link", { name: "Skip to content" }));
    expect(screen.getByRole("main")).toHaveFocus();
    expect(navigationLinks.map((link) => link.textContent)).toEqual([
      "Niamh & Brandon",
      "Home",
      "Wedding Day",
      "FAQ",
      "Registry & Gifts",
      "RSVP"
    ]);
    expect(
      within(navigation).getByRole("link", { name: "Home" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByRole("link", { name: "RSVP" })
    ).toHaveAttribute("data-appearance", "action");
    const weddingDayLink = within(navigation).getByRole("link", {
      name: "Wedding Day"
    });
    expect(weddingDayLink).toHaveAttribute("href", "/wedding-day");
    fireEvent.click(weddingDayLink);

    expect(window.location.pathname).toBe("/wedding-day");
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
    expect(
      within(
        screen.getByRole("navigation", { name: "Main navigation" })
      ).getByRole("link", { name: "Wedding Day" })
    ).toHaveAttribute("aria-current", "page");

    const navigationAfterWeddingDay = screen.getByRole("navigation", {
      name: "Main navigation"
    });
    const faqLink = within(navigationAfterWeddingDay).getByRole("link", {
      name: "FAQ"
    });
    expect(faqLink).toHaveAttribute("href", "/faq");
    fireEvent.click(faqLink);

    expect(window.location.pathname).toBe("/faq");
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
    expect(
      within(
        screen.getByRole("navigation", { name: "Main navigation" })
      ).getByRole("link", { name: "FAQ" })
    ).toHaveAttribute("aria-current", "page");

    const updatedNavigation = screen.getByRole("navigation", {
      name: "Main navigation"
    });
    const registryLink = within(updatedNavigation).getByRole("link", {
      name: "Registry & Gifts"
    });
    expect(registryLink).toHaveAttribute("href", "/registry");
    fireEvent.click(registryLink);

    expect(window.location.pathname).toBe("/registry");
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
    expect(
      within(
        screen.getByRole("navigation", { name: "Main navigation" })
      ).getByRole("link", { name: "Registry & Gifts" })
    ).toHaveAttribute("aria-current", "page");

    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Main navigation" })
      ).getByRole("link", { name: "RSVP" })
    );

    expect(window.location.pathname).toBe("/RSVP");
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
    expect(scrollTo).toHaveBeenCalledWith({
      behavior: "auto",
      left: 0,
      top: 0
    });
    const currentNavigation = screen.getByRole("navigation", {
      name: "Main navigation"
    });
    expect(
      within(currentNavigation).getByRole("link", { name: "RSVP" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(currentNavigation).getByRole("link", { name: "RSVP" })
    ).toHaveAttribute("data-appearance", "current");
  });

  it("respects modified clicks and makes current-page activation history-neutral", () => {
    installMatchMedia(true);
    const onStartRsvp = vi.fn();
    render(<App onStartRsvp={onStartRsvp} />);
    const navigation = screen.getByRole("navigation", {
      name: "Main navigation"
    });
    const rsvpLink = within(navigation).getByRole("link", { name: "RSVP" });
    const modifiedClick = new MouseEvent("click", {
      bubbles: true,
      button: 0,
      cancelable: true,
      metaKey: true
    });

    document.addEventListener("click", (event) => event.preventDefault(), {
      once: true
    });
    rsvpLink.dispatchEvent(modifiedClick);

    expect(window.location.pathname).toBe("/");
    expect(onStartRsvp).toHaveBeenCalledOnce();

    window.history.replaceState(null, "", "/RSVP");
    fireEvent.popState(window);
    const pushState = vi.spyOn(window.history, "pushState");
    const currentRsvp = within(
      screen.getByRole("navigation", { name: "Main navigation" })
    ).getByRole("link", { name: "RSVP" });

    fireEvent.click(currentRsvp);

    expect(window.location.pathname).toBe("/RSVP");
    expect(pushState).not.toHaveBeenCalled();
  });

  it("uses an icon-only closed mobile toggle and follows disclosure focus and dismissal rules", () => {
    const matchMedia = installMatchMedia(false);
    render(<App />);
    const navigation = screen.getByRole("navigation", {
      name: "Main navigation"
    });

    expect(
      within(navigation).getByRole("link", { name: "N&B" })
    ).toHaveAttribute("href", "/");
    const toggle = within(navigation).getByRole("button", {
      name: "Open navigation menu"
    });
    expect(toggle).toHaveAttribute("aria-controls", navigationPanelId);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("");
    expect(document.getElementById(navigationPanelId)).not.toBeVisible();

    toggle.focus();
    fireEvent.click(toggle);

    const closeToggle = within(navigation).getByRole("button", {
      name: "Close navigation menu"
    });
    const panel = document.getElementById(navigationPanelId)!;
    const panelHome = within(panel).getByRole("link", { name: "Home" });
    expect(closeToggle).toHaveFocus();
    expect(closeToggle).toHaveAttribute("aria-expanded", "true");
    expect(closeToggle).toHaveTextContent("");
    expect(panel).toBeVisible();
    expect(within(panel).getAllByRole("link")).toHaveLength(4);

    panelHome.focus();
    fireEvent.keyDown(panelHome, { key: "Escape" });

    expect(toggle).toHaveFocus();
    expect(panel).not.toBeVisible();

    fireEvent.click(toggle);
    act(() => screen.getByRole("main").focus());
    expect(panel).not.toBeVisible();

    fireEvent.click(toggle);
    fireEvent.click(panelHome);
    expect(window.location.pathname).toBe("/");
    expect(panel).not.toBeVisible();

    fireEvent.click(toggle);
    toggle.focus();
    matchMedia.setMatches(true);

    expect(
      within(navigation).getByRole("link", { name: "Niamh & Brandon" })
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole("link", { name: "Home" })
    ).toHaveFocus();
    expect(
      within(navigation).queryByRole("button", {
        name: /navigation menu/i
      })
    ).toBeNull();

    matchMedia.setMatches(false);
    fireEvent.click(
      within(navigation).getByRole("button", {
        name: "Open navigation menu"
      })
    );
    within(document.getElementById(navigationPanelId)!)
      .getByRole("link", { name: "Wedding Day" })
      .focus();
    matchMedia.setMatches(true);
    expect(
      within(navigation).getByRole("link", { name: "Wedding Day" })
    ).toHaveFocus();
  });

  it("closes the mobile disclosure on outside pointer and browser history navigation", async () => {
    installMatchMedia(false);
    const scrollTo = vi.spyOn(window, "scrollTo");
    render(<App />);
    const navigation = screen.getByRole("navigation", {
      name: "Main navigation"
    });
    const toggle = within(navigation).getByRole("button", {
      name: "Open navigation menu"
    });

    fireEvent.click(toggle);
    const panel = document.getElementById(navigationPanelId)!;
    fireEvent.pointerDown(screen.getByRole("main"));
    expect(panel).not.toBeVisible();

    fireEvent.click(within(navigation).getByRole("link", { name: "RSVP" }));
    expect(scrollTo).toHaveBeenCalledOnce();
    scrollTo.mockClear();
    const rsvpNavigation = screen.getByRole("navigation", {
      name: "Main navigation"
    });
    fireEvent.click(
      within(rsvpNavigation).getByRole("button", {
        name: "Open navigation menu"
      })
    );
    expect(panel).toBeVisible();

    window.history.replaceState(null, "", "/");
    fireEvent.popState(window);

    await screen.findByRole("heading", { name: "Niamh & Brandon" });
    expect(panel).not.toBeVisible();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
