import type { FieldValues } from "react-hook-form";

import {
  type FormFieldName,
  useFormField
} from "../FormField/useFormField";
import { CheckboxGroup, type CheckboxGroupProps } from "./CheckboxGroup";

export type FormCheckboxGroupProps<
  TFieldValues extends FieldValues,
  TValue = string
> = Omit<
  CheckboxGroupProps<TValue>,
  | "defaultValue"
  | "error"
  | "name"
  | "onBlur"
  | "onValueChange"
  | "value"
> & {
  disabled?: boolean;
  name: FormFieldName<TFieldValues, TValue[]>;
};

export function FormCheckboxGroup<
  TFieldValues extends FieldValues,
  TValue = string
>({
  disabled = false,
  name,
  ...props
}: FormCheckboxGroupProps<TFieldValues, TValue>) {
  const {
    error,
    isDisabled,
    name: fieldName,
    onBlur,
    ref,
    setValue,
    value
  } = useFormField<TFieldValues, TValue[], HTMLInputElement>(name, disabled);

  return (
    <CheckboxGroup
      {...props}
      disabled={isDisabled}
      error={error}
      name={fieldName}
      ref={ref}
      value={value}
      onBlur={onBlur}
      onValueChange={setValue}
    />
  );
}
