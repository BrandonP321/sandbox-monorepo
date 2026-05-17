import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type * as React from "react";

import { ContentHeader } from "../ContentHeader";
import { ProgressiveResponsiveImage } from "../ProgressiveResponsiveImage";
import type { ProgressiveResponsiveImageSource } from "../ProgressiveResponsiveImage";
import purpleBlackHoleDesktopLowResUrl from "./assets/purple-blackhole-desktop-low-res.jpg";
import purpleBlackHoleDesktopUrl from "./assets/purple-blackhole-desktop.jpg";
import purpleBlackHoleMobileLowResUrl from "./assets/purple-blackhole-mobile-low-res.jpg";
import purpleBlackHoleMobileUrl from "./assets/purple-blackhole-mobile.jpg";
import { getBlackHoleParallaxCenterY } from "./parallax";
import { ActionsContainer } from "../ActionsContainer";
import { LinkedInButton } from "../LinkedInButton";
import { GithubButton } from "../GithubButton";

const blackHoleImageSources = [
  {
    media: "(max-width: 720px)",
    lowResSrc: purpleBlackHoleMobileLowResUrl,
    src: purpleBlackHoleMobileUrl
  },
  {
    lowResSrc: purpleBlackHoleDesktopLowResUrl,
    src: purpleBlackHoleDesktopUrl
  }
] satisfies [
  ProgressiveResponsiveImageSource,
  ...ProgressiveResponsiveImageSource[]
];

type HeroSectionNativeProps = Pick<
  React.ComponentProps<"section">,
  "className" | "id"
>;

type HeroSectionProps = HeroSectionNativeProps & {
  description: ReactNode;
  title: ReactNode;
};

function HeroSection({ className, description, id, title }: HeroSectionProps) {
  const blackHoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blackHole = blackHoleRef.current;

    if (!blackHole) {
      return;
    }

    const scrollContainer = blackHole.closest<HTMLElement>(
      '[data-slot="portfolio-scroll-container"]'
    );

    const updateBlackHolePosition = () => {
      const scrollingElement =
        scrollContainer ??
        document.scrollingElement ??
        document.documentElement;
      const scrollContainerHeight =
        scrollContainer?.clientHeight || window.innerHeight;
      const viewportHeight = getVisibleViewportHeight(scrollContainerHeight);
      const centerY = getBlackHoleParallaxCenterY({
        scrollContainerHeight,
        scrollHeight: scrollingElement.scrollHeight,
        scrollY: scrollContainer ? scrollContainer.scrollTop : window.scrollY,
        viewportHeight
      });

      blackHole.style.setProperty(
        "--portfolio-black-hole-center-y",
        `${centerY}px`
      );
    };

    updateBlackHolePosition();
    const scrollTarget = scrollContainer ?? window;
    const visualViewport = window.visualViewport;
    scrollTarget.addEventListener("scroll", updateBlackHolePosition, {
      passive: true
    });
    window.addEventListener("resize", updateBlackHolePosition);
    visualViewport?.addEventListener("resize", updateBlackHolePosition);
    visualViewport?.addEventListener("scroll", updateBlackHolePosition);

    return () => {
      scrollTarget.removeEventListener("scroll", updateBlackHolePosition);
      window.removeEventListener("resize", updateBlackHolePosition);
      visualViewport?.removeEventListener("resize", updateBlackHolePosition);
      visualViewport?.removeEventListener("scroll", updateBlackHolePosition);
    };
  }, []);

  return (
    <section
      className={["portfolio-hero-section", className]
        .filter(Boolean)
        .join(" ")}
      data-slot="hero-section"
      id={id}
    >
      <div className="portfolio-hero-section__content">
        <ContentHeader
          className="portfolio-hero-section__header"
          description={description}
          title={title}
          alignActions="bottom"
          actions={
            <ActionsContainer>
              <LinkedInButton size="large" variant="primary" />
              <GithubButton size="large" />
            </ActionsContainer>
          }
        />
      </div>

      <div
        aria-hidden="true"
        className="portfolio-hero-section__black-hole"
        data-slot="hero-black-hole"
        ref={blackHoleRef}
      >
        <ProgressiveResponsiveImage
          alt=""
          className="portfolio-hero-section__black-hole-image"
          dataSlot="hero-black-hole-image"
          sources={blackHoleImageSources}
        />
      </div>
    </section>
  );
}

function getVisibleViewportHeight(fallbackHeight: number) {
  const visualViewportHeight = window.visualViewport?.height;

  if (typeof visualViewportHeight !== "number" || visualViewportHeight <= 0) {
    return fallbackHeight;
  }

  return Math.min(visualViewportHeight, fallbackHeight);
}

export { HeroSection, type HeroSectionProps };
