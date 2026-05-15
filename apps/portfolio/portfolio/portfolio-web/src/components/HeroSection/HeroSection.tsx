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
  "className"
>;

type HeroSectionProps = HeroSectionNativeProps & {
  description: ReactNode;
  title: ReactNode;
};

function HeroSection({ className, description, title }: HeroSectionProps) {
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
      const centerY = getBlackHoleParallaxCenterY({
        scrollHeight: scrollingElement.scrollHeight,
        scrollY: scrollContainer ? scrollContainer.scrollTop : window.scrollY,
        viewportHeight: scrollContainer?.clientHeight || window.innerHeight
      });

      blackHole.style.setProperty(
        "--portfolio-black-hole-center-y",
        `${centerY}px`
      );
    };

    updateBlackHolePosition();
    const scrollTarget = scrollContainer ?? window;
    scrollTarget.addEventListener("scroll", updateBlackHolePosition, {
      passive: true
    });
    window.addEventListener("resize", updateBlackHolePosition);

    return () => {
      scrollTarget.removeEventListener("scroll", updateBlackHolePosition);
      window.removeEventListener("resize", updateBlackHolePosition);
    };
  }, []);

  return (
    <section
      className={["portfolio-hero-section", className]
        .filter(Boolean)
        .join(" ")}
      data-slot="hero-section"
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

export { HeroSection, type HeroSectionProps };
