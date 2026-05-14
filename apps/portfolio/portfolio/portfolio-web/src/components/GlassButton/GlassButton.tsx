import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type * as React from "react";

import {
  formatBlackHoleAccentCssValue,
  getBlackHoleAccentPosition
} from "./blackHoleAccent";

const heroBlackHoleImageSelector = '[data-slot="hero-black-hole-image"]';
const portfolioScrollContainerSelector =
  '[data-slot="portfolio-scroll-container"]';

type GlassButtonVariant = "primary" | "secondary";

const variantGlowBoostAlpha = {
  primary: 0.42,
  secondary: 0.08
} satisfies Record<GlassButtonVariant, number>;

type GlassButtonNativeProps = Pick<
  React.ComponentProps<"button">,
  "aria-label" | "className" | "disabled" | "onClick" | "type"
>;

type GlassButtonProps = GlassButtonNativeProps & {
  children: ReactNode;
  icon?: ReactNode;
  variant?: GlassButtonVariant;
};

function GlassButton({
  children,
  className,
  icon,
  type = "button",
  variant = "primary",
  ...buttonProps
}: GlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useBlackHoleAccentTracking(buttonRef, variant);

  return (
    <button
      {...buttonProps}
      className={[
        "portfolio-glass-button",
        `portfolio-glass-button--${variant}`,
        className
      ]
        .filter(Boolean)
        .join(" ")}
      data-slot="glass-button"
      ref={buttonRef}
      type={type}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="portfolio-glass-button__icon"
          data-slot="glass-button-icon"
        >
          {icon}
        </span>
      ) : null}
      <span className="portfolio-glass-button__label">{children}</span>
    </button>
  );
}

function useBlackHoleAccentTracking(
  buttonRef: React.RefObject<HTMLButtonElement | null>,
  variant: GlassButtonVariant
) {
  useEffect(() => {
    const button = buttonRef.current;

    if (!button || typeof window === "undefined") {
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
        buttonRect: button.getBoundingClientRect(),
        targetRect: blackHoleImage.getBoundingClientRect()
      });

      if (!accentPosition) {
        return;
      }

      button.style.setProperty(
        "--portfolio-glass-button-accent-angle",
        `${formatBlackHoleAccentCssValue(accentPosition.angleDegrees)}deg`
      );
      button.style.setProperty(
        "--portfolio-glass-button-glow-boost-alpha",
        formatBlackHoleAccentCssValue(
          accentPosition.glowBoostProgress * variantGlowBoostAlpha[variant]
        )
      );
      button.style.setProperty(
        "--portfolio-glass-button-glow-shadow-x",
        formatBlackHoleAccentCssValue(accentPosition.glowShadowX)
      );
      button.style.setProperty(
        "--portfolio-glass-button-glow-shadow-y",
        formatBlackHoleAccentCssValue(accentPosition.glowShadowY)
      );
      button.style.setProperty(
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
    const scrollContainer = button.closest<HTMLElement>(
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
    resizeObserver?.observe(button);

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
  }, [buttonRef, variant]);
}

export { GlassButton, type GlassButtonProps, type GlassButtonVariant };
