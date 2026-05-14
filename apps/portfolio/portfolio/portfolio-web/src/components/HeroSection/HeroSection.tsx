import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type * as React from "react";

import { ContentHeader } from "../ContentHeader";
import purpleBlackHoleDesktopUrl from "./assets/purple-blackhole-desktop.jpg";
import { getBlackHoleParallaxCenterY } from "./parallax";

const desktopBlackHoleUrl = purpleBlackHoleDesktopUrl;

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

    const updateBlackHolePosition = () => {
      const scrollingElement =
        document.scrollingElement ?? document.documentElement;
      const centerY = getBlackHoleParallaxCenterY({
        scrollHeight: scrollingElement.scrollHeight,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight
      });

      blackHole.style.setProperty(
        "--portfolio-black-hole-center-y",
        `${centerY}px`
      );
    };

    updateBlackHolePosition();
    window.addEventListener("scroll", updateBlackHolePosition, {
      passive: true
    });
    window.addEventListener("resize", updateBlackHolePosition);

    return () => {
      window.removeEventListener("scroll", updateBlackHolePosition);
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
        />
      </div>

      <div
        aria-hidden="true"
        className="portfolio-hero-section__black-hole"
        data-slot="hero-black-hole"
        ref={blackHoleRef}
      >
        <img
          alt=""
          className="portfolio-hero-section__black-hole-image"
          src={desktopBlackHoleUrl}
        />
      </div>
    </section>
  );
}

export { HeroSection, type HeroSectionProps };
