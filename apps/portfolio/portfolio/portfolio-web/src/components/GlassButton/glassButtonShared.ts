import { useEffect } from "react";
import type { RefObject } from "react";

import {
  formatBlackHoleAccentCssValue,
  getBlackHoleAccentPosition
} from "./blackHoleAccent";

const heroBlackHoleImageSelector = '[data-slot="hero-black-hole-image"]';
const portfolioScrollContainerSelector =
  '[data-slot="portfolio-scroll-container"]';

type GlassButtonVariant = "primary" | "secondary";
type GlassButtonSize = "default" | "large";

const variantGlowBoostAlpha = {
  primary: 0.42,
  secondary: 0.08
} satisfies Record<GlassButtonVariant, number>;

function getGlassButtonClassName({
  className,
  size,
  variant
}: {
  className?: string;
  size: GlassButtonSize;
  variant: GlassButtonVariant;
}) {
  return [
    "portfolio-glass-button",
    `portfolio-glass-button--${variant}`,
    `portfolio-glass-button--${size}`,
    className
  ]
    .filter(Boolean)
    .join(" ");
}

function useGlassButtonAccentTracking(
  elementRef: RefObject<HTMLElement | null>,
  variant: GlassButtonVariant
) {
  useEffect(() => {
    const element = elementRef.current;

    if (!element || typeof window === "undefined") {
      return;
    }

    const getBlackHoleImage = () =>
      document.querySelector<HTMLElement>(heroBlackHoleImageSelector);
    const updateAccentPosition = () => {
      const blackHoleImage = getBlackHoleImage();

      if (!blackHoleImage) {
        return;
      }

      const accentPosition = getBlackHoleAccentPosition({
        buttonRect: element.getBoundingClientRect(),
        targetRect: blackHoleImage.getBoundingClientRect()
      });

      if (!accentPosition) {
        return;
      }

      element.style.setProperty(
        "--portfolio-glass-button-accent-angle",
        `${formatBlackHoleAccentCssValue(accentPosition.angleDegrees)}deg`
      );
      element.style.setProperty(
        "--portfolio-glass-button-glow-boost-alpha",
        formatBlackHoleAccentCssValue(
          accentPosition.glowBoostProgress * variantGlowBoostAlpha[variant]
        )
      );
      element.style.setProperty(
        "--portfolio-glass-button-glow-shadow-x",
        formatBlackHoleAccentCssValue(accentPosition.glowShadowX)
      );
      element.style.setProperty(
        "--portfolio-glass-button-glow-shadow-y",
        formatBlackHoleAccentCssValue(accentPosition.glowShadowY)
      );
      element.style.setProperty(
        "--portfolio-glass-button-glow-strength",
        formatBlackHoleAccentCssValue(accentPosition.glowStrength)
      );
    };
    let frameId: number | null = null;
    const requestFrame = (callback: FrameRequestCallback) => {
      if (window.requestAnimationFrame) {
        return window.requestAnimationFrame(callback);
      }

      return window.setTimeout(
        () => callback(window.performance?.now() ?? Date.now()),
        16
      );
    };
    const cancelFrame = (id: number) => {
      if (window.cancelAnimationFrame) {
        window.cancelAnimationFrame(id);
        return;
      }

      window.clearTimeout(id);
    };
    const scheduleAccentUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = requestFrame(() => {
        frameId = null;
        updateAccentPosition();
      });
    };
    const scrollContainer = element.closest<HTMLElement>(
      portfolioScrollContainerSelector
    );
    const scrollTarget: EventTarget = scrollContainer ?? window;
    const ResizeObserverConstructor = window.ResizeObserver;
    const resizeObserver = ResizeObserverConstructor
      ? new ResizeObserverConstructor(scheduleAccentUpdate)
      : null;

    updateAccentPosition();
    scrollTarget.addEventListener("scroll", scheduleAccentUpdate, {
      passive: true
    });
    window.addEventListener("resize", scheduleAccentUpdate);
    resizeObserver?.observe(element);

    const blackHoleImage = getBlackHoleImage();

    if (blackHoleImage) {
      resizeObserver?.observe(blackHoleImage);
    }

    return () => {
      if (frameId !== null) {
        cancelFrame(frameId);
      }

      scrollTarget.removeEventListener("scroll", scheduleAccentUpdate);
      window.removeEventListener("resize", scheduleAccentUpdate);
      resizeObserver?.disconnect();
    };
  }, [elementRef, variant]);
}

export {
  getGlassButtonClassName,
  type GlassButtonSize,
  type GlassButtonVariant,
  useGlassButtonAccentTracking
};
