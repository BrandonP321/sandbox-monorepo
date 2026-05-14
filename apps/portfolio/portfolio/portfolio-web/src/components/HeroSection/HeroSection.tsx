import type { ReactNode } from "react";
import type * as React from "react";

import { ContentHeader } from "../ContentHeader";
import purpleBlackHoleDesktopUrl from "./assets/purple-blackhole-desktop.jpg";

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
