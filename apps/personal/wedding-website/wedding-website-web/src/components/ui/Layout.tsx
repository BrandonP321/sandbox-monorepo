import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { classNames } from "./classNames";

type ContentWidth = "form" | "hero";

type ContentFrameProps = ComponentPropsWithoutRef<"div"> & {
  width?: ContentWidth;
};

const ContentFrame = forwardRef<HTMLDivElement, ContentFrameProps>(
  function ContentFrame({ className, width = "form", ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={classNames("ui-content-frame", className)}
        data-width={width}
      />
    );
  }
);

type FormSectionProps = ComponentPropsWithoutRef<"section">;

const FormSection = forwardRef<HTMLElement, FormSectionProps>(
  function FormSection({ className, ...props }, ref) {
    return (
      <section
        {...props}
        ref={ref}
        className={classNames("ui-form-section", className)}
      />
    );
  }
);

type DecorativeLayerProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "aria-hidden"
>;

const DecorativeLayer = forwardRef<HTMLDivElement, DecorativeLayerProps>(
  function DecorativeLayer({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        aria-hidden="true"
        className={classNames("ui-decorative-layer", className)}
      />
    );
  }
);

export {
  ContentFrame,
  DecorativeLayer,
  FormSection,
  type ContentFrameProps,
  type ContentWidth,
  type DecorativeLayerProps,
  type FormSectionProps
};
