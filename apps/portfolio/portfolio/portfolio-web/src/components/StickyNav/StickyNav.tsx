import { useState } from "react";
import type * as React from "react";

type StickyNavItem = {
  href: string;
  label: string;
  openInNewTab?: boolean;
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
  shadowX: number;
  top: number;
  width: number;
};

type StickyNavStyle = React.CSSProperties & {
  "--portfolio-sticky-nav-slider-height"?: string;
  "--portfolio-sticky-nav-slider-left"?: string;
  "--portfolio-sticky-nav-slider-shadow-x"?: string;
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
    const borderWidths = getElementBorderWidths(navElement);

    // Absolute children are positioned from the nav's padding edge, while
    // getBoundingClientRect measures from the outside edge of the nav border.
    setSliderPosition({
      height: linkRect.height + borderWidths.top + borderWidths.bottom,
      left: linkRect.left - navRect.left - borderWidths.left * 2,
      shadowX: getSliderShadowX({ linkRect, navRect }),
      top: linkRect.top - navRect.top - borderWidths.top * 2,
      width: linkRect.width + borderWidths.left + borderWidths.right
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
        "--portfolio-sticky-nav-slider-shadow-x": formatCssNumber(
          sliderPosition.shadowX
        ),
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
            rel={item.openInNewTab ? "noreferrer" : undefined}
            target={item.openInNewTab ? "_blank" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function getElementBorderWidths(element: HTMLElement) {
  const elementStyle = window.getComputedStyle(element);

  return {
    bottom: getPixelValue(elementStyle.borderBottomWidth),
    left: getPixelValue(elementStyle.borderLeftWidth),
    right: getPixelValue(elementStyle.borderRightWidth),
    top: getPixelValue(elementStyle.borderTopWidth)
  };
}

function getPixelValue(value: string) {
  const parsedValue = Number.parseFloat(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getSliderShadowX({
  linkRect,
  navRect
}: {
  linkRect: DOMRect;
  navRect: DOMRect;
}) {
  const navCenterX = navRect.left + navRect.width / 2;
  const linkCenterX = linkRect.left + linkRect.width / 2;
  const maxCenterDistance = Math.max(navRect.width / 2 - linkRect.width / 2, 1);

  return clamp((linkCenterX - navCenterX) / maxCenterDistance, -1, 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatCssNumber(value: number) {
  return Number(value.toFixed(3)).toString();
}

export { StickyNav, type StickyNavItem, type StickyNavProps };
