import { type InputHTMLAttributes } from "react";
import type { FieldValues } from "react-hook-form";

import { FormField, type FormFieldContentProps } from "../FormField/FormField";
import { type FormFieldName, useFormField } from "../FormField/useFormField";
import styles from "./Input.module.scss";

type NativeInputPropKeys =
  | "autoComplete"
  | "autoFocus"
  | "inputMode"
  | "placeholder"
  | "readOnly"
  | "required"
  | "type";

type NativeInputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  NativeInputPropKeys
>;

export type InputProps<TFieldValues extends FieldValues> = NativeInputProps &
  FormFieldContentProps & {
    disabled?: boolean;
    name: FormFieldName<TFieldValues, string>;
  };

export function Input<TFieldValues extends FieldValues>({
  description,
  disabled = false,
  label,
  name,
  type = "text",
  ...props
}: InputProps<TFieldValues>) {
  const { error, inputId, isDisabled, onBlur, ref, setValue, value } =
    useFormField<TFieldValues, string>(name, disabled);

  return (
    <FormField
      description={description}
      error={error}
      id={inputId}
      label={label}
    >
      <input
        aria-invalid={error ? true : undefined}
        {...props}
        className={styles.input}
        disabled={isDisabled}
        id={inputId}
        name={name}
        ref={ref}
        type={type}
        value={value ?? ""}
        onBlur={onBlur}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
    </FormField>
  );
}
