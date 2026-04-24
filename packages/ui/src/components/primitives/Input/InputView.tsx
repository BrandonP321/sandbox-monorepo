import { forwardRef } from "react";

import type { InputViewProps } from "./Input";

import { cn } from "../../../lib/cn";
import { FormField } from "../FormField/FormField";
import { Icon } from "../Icon/Icon";
import styles from "./Input.module.scss";

export type { InputViewProps } from "./Input";

export const InputView = forwardRef<
  HTMLInputElement,
  InputViewProps
>(function InputView(
  {
    ariaLabel,
    description,
    error,
    iconLeft,
    id,
    label,
    type = "text",
    ...props
  },
  ref
) {
  return (
    <FormField description={description} error={error} id={id} label={label}>
      <div className={styles.root}>
        <input
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          {...props}
          className={cn(styles.input, iconLeft && styles.inputWithIcon)}
          id={id}
          ref={ref}
          type={type}
        />
        {iconLeft ? (
          <span className={styles.icon}>
            <Icon icon={iconLeft} size="sm" />
          </span>
        ) : null}
      </div>
    </FormField>
  );
});
