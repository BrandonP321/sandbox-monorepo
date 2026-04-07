import { forwardRef, type InputHTMLAttributes, useId } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "../../../lib/cn";
import { FormField, type FormFieldContentProps } from "../FormField/FormField";
import { Icon } from "../Icon/Icon";
import styles from "./Input.module.scss";

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children"
> &
  FormFieldContentProps & {
    error?: string;
    iconLeft?: LucideIcon;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
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
  const generatedId = useId();
  const inputId = id ?? `input-${generatedId}`;

  return (
    <FormField description={description} error={error} id={inputId} label={label}>
      <div className={styles.root}>
        <input
          aria-invalid={error ? true : undefined}
          {...props}
          className={cn(
            styles.input,
            iconLeft && styles.inputWithIcon,
            className
          )}
          id={inputId}
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
