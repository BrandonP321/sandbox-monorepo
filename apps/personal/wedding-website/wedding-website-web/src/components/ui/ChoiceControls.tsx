import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode
} from "react";

import { classNames } from "./classNames";

type ChoiceGroupProps = Omit<
  ComponentPropsWithoutRef<"fieldset">,
  "children"
> & {
  children: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  legend: ReactNode;
};

function ChoiceGroup({
  "aria-describedby": ariaDescribedBy,
  children,
  className,
  description,
  error,
  legend,
  ...props
}: ChoiceGroupProps) {
  const generatedId = useId().replaceAll(":", "");
  const descriptionId = description
    ? `choice-group-${generatedId}-description`
    : undefined;
  const errorId = error ? `choice-group-${generatedId}-error` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId, errorId]
    .filter(Boolean)
    .join(" ");

  return (
    <fieldset
      {...props}
      aria-describedby={describedBy || undefined}
      aria-invalid={error ? true : undefined}
      className={classNames("ui-choice-group", className)}
    >
      <legend className="ui-choice-group__legend">{legend}</legend>
      {description ? (
        <p className="ui-choice-group__description" id={descriptionId}>
          {description}
        </p>
      ) : null}
      <div className="ui-choice-group__options">{children}</div>
      {error ? (
        <p className="ui-choice-group__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

type ChoiceRowProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "children" | "type"
> & {
  description?: ReactNode;
  label: ReactNode;
};

const ChoiceRow = forwardRef<HTMLInputElement, ChoiceRowProps>(
  function ChoiceRow(
    {
      "aria-describedby": ariaDescribedBy,
      className,
      description,
      disabled,
      id,
      label,
      ...props
    },
    ref
  ) {
    const generatedId = useId().replaceAll(":", "");
    const controlId = id ?? `choice-row-${generatedId}`;
    const descriptionId = description ? `${controlId}-description` : undefined;
    const describedBy = [ariaDescribedBy, descriptionId]
      .filter(Boolean)
      .join(" ");

    return (
      <label className="ui-choice-row" data-disabled={disabled || undefined}>
        <input
          {...props}
          ref={ref}
          aria-describedby={describedBy || undefined}
          className={classNames("ui-choice-row__control", className)}
          disabled={disabled}
          id={controlId}
          type="radio"
        />
        <span className="ui-choice-row__copy">
          <span className="ui-choice-row__label">{label}</span>
          {description ? (
            <span className="ui-choice-row__description" id={descriptionId}>
              {description}
            </span>
          ) : null}
        </span>
      </label>
    );
  }
);

export { ChoiceGroup, ChoiceRow, type ChoiceGroupProps, type ChoiceRowProps };
