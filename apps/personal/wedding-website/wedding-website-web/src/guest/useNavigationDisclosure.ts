import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent
} from "react";

const desktopNavigationQuery = "(min-width: 64rem)";

type BreakpointFocusTarget = "brand" | "home" | "rsvp";

function getInitialDesktopState(): boolean {
  if (typeof window.matchMedia === "function") {
    return window.matchMedia(desktopNavigationQuery).matches;
  }

  return window.innerWidth >= 1024;
}

function useNavigationDisclosure(navigationRevision: number) {
  const [isDesktop, setIsDesktop] = useState(getInitialDesktopState);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const desktopHomeRef = useRef<HTMLAnchorElement>(null);
  const rsvpRef = useRef<HTMLAnchorElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const breakpointFocusTarget = useRef<BreakpointFocusTarget | null>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(desktopNavigationQuery);

    function handleBreakpointChange(event: MediaQueryListEvent) {
      const activeElement = document.activeElement;
      const activeDestination =
        activeElement instanceof HTMLElement
          ? activeElement.dataset.destination
          : undefined;

      if (
        headerRef.current?.contains(activeElement) &&
        activeElement !== brandRef.current
      ) {
        if (event.matches) {
          breakpointFocusTarget.current =
            activeDestination === "rsvp" ? "rsvp" : "home";
        } else if (activeDestination === "rsvp") {
          breakpointFocusTarget.current = "rsvp";
        } else {
          breakpointFocusTarget.current = "brand";
        }
      }

      if (event.matches) {
        setIsMenuOpen(false);
      }
      setIsDesktop(event.matches);
    }

    mediaQuery.addEventListener("change", handleBreakpointChange);
    return () =>
      mediaQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  useLayoutEffect(() => {
    const target = breakpointFocusTarget.current;
    breakpointFocusTarget.current = null;

    if (target === "home") {
      desktopHomeRef.current?.focus();
    } else if (target === "rsvp") {
      rsvpRef.current?.focus();
    } else if (target === "brand") {
      brandRef.current?.focus();
    }
  }, [isDesktop]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigationRevision]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function closeForOutsidePointer(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function closeWhenFocusLeaves(event: FocusEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeForOutsidePointer);
    document.addEventListener("focusin", closeWhenFocusLeaves);
    return () => {
      document.removeEventListener("pointerdown", closeForOutsidePointer);
      document.removeEventListener("focusin", closeWhenFocusLeaves);
    };
  }, [isMenuOpen]);

  function handleHeaderKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || !isMenuOpen) {
      return;
    }

    event.preventDefault();
    setIsMenuOpen(false);
    toggleRef.current?.focus();
  }

  return {
    brandRef,
    closeMenu: () => setIsMenuOpen(false),
    desktopHomeRef,
    handleHeaderKeyDown,
    headerRef,
    isDesktop,
    isMenuOpen,
    rsvpRef,
    toggleMenu: () => setIsMenuOpen((isOpen) => !isOpen),
    toggleRef
  };
}

export { useNavigationDisclosure };
