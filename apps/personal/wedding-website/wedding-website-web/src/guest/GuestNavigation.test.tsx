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
  it("renders the desktop Home and RSVP information architecture with current-page state", async () => {
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
      "RSVP"
    ]);
    expect(
      within(navigation).getByRole("link", { name: "Home" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByRole("link", { name: "RSVP" })
    ).toHaveAttribute("data-appearance", "action");
    expect(within(navigation).queryByText("Wedding Day")).toBeNull();
    expect(within(navigation).queryByText("FAQ")).toBeNull();
    expect(within(navigation).queryByText("Registry & Gifts")).toBeNull();

    fireEvent.click(within(navigation).getByRole("link", { name: "RSVP" }));

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
    expect(within(panel).getAllByRole("link")).toHaveLength(1);

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
