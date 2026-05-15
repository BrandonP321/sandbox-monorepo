import { useState } from "react";
import type * as React from "react";

type StickyNavItem = {
  href: string;
  label: string;
};

type StickyNavNativeProps = Pick<
  React.ComponentProps<"nav">,
  "aria-label" | "className"
>;

type StickyNavProps = StickyNavNativeProps & {
  items: readonly [StickyNavItem, ...StickyNavItem[]];
};

type SliderPosition = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type StickyNavStyle = React.CSSProperties & {
  "--portfolio-sticky-nav-slider-height"?: string;
  "--portfolio-sticky-nav-slider-left"?: string;
  "--portfolio-sticky-nav-slider-top"?: string;
  "--portfolio-sticky-nav-slider-width"?: string;
};

function StickyNav({
  "aria-label": ariaLabel = "Portfolio sections",
  className,
  items
}: StickyNavProps) {
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [shouldAnimateSliderPosition, setShouldAnimateSliderPosition] =
    useState(false);
  const [sliderPosition, setSliderPosition] = useState<SliderPosition | null>(
    null
  );

  const updateSliderPosition = (
    navElement: HTMLElement,
    linkElement: HTMLElement
  ) => {
    const navRect = navElement.getBoundingClientRect();
    const linkRect = linkElement.getBoundingClientRect();

    setSliderPosition({
      height: linkRect.height,
      left: linkRect.left - navRect.left,
      top: linkRect.top - navRect.top,
      width: linkRect.width
    });
    setShouldAnimateSliderPosition(isSliderVisible);
    setIsSliderVisible(true);
  };

  const hideSlider = () => {
    setIsSliderVisible(false);
    setShouldAnimateSliderPosition(false);
  };

  const style: StickyNavStyle | undefined = sliderPosition
    ? ({
        "--portfolio-sticky-nav-slider-height": `${sliderPosition.height}px`,
        "--portfolio-sticky-nav-slider-left": `${sliderPosition.left}px`,
        "--portfolio-sticky-nav-slider-top": `${sliderPosition.top}px`,
        "--portfolio-sticky-nav-slider-width": `${sliderPosition.width}px`
      } satisfies StickyNavStyle)
    : undefined;

  return (
    <div className="portfolio-sticky-nav-shell" data-slot="sticky-nav-shell">
      <nav
        aria-label={ariaLabel}
        className={["portfolio-sticky-nav", className]
          .filter(Boolean)
          .join(" ")}
        data-slider-motion={shouldAnimateSliderPosition ? "true" : "false"}
        data-slider-visible={isSliderVisible ? "true" : "false"}
        data-slot="sticky-nav"
        onBlur={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            hideSlider();
          }
        }}
        onMouseLeave={() => {
          hideSlider();
        }}
        style={style}
      >
        <span aria-hidden="true" className="portfolio-sticky-nav__slider" />

        {items.map((item) => (
          <a
            className="portfolio-sticky-nav__link"
            href={item.href}
            key={item.href}
            onFocus={(event) => {
              updateSliderPosition(
                event.currentTarget.parentElement!,
                event.currentTarget
              );
            }}
            onMouseEnter={(event) => {
              updateSliderPosition(
                event.currentTarget.parentElement!,
                event.currentTarget
              );
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

export { StickyNav, type StickyNavItem, type StickyNavProps };
