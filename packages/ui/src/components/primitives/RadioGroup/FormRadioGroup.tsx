import type { FieldValues } from "react-hook-form";

import {
  type FormFieldName,
  useFormField
} from "../FormField/useFormField";
import { RadioGroup, type RadioGroupProps } from "./RadioGroup";

export type FormRadioGroupProps<
  TFieldValues extends FieldValues,
  TValue = string
> = Omit<
  RadioGroupProps<TValue>,
  | "defaultValue"
  | "error"
  | "name"
  | "onBlur"
  | "onValueChange"
  | "value"
> & {
  disabled?: boolean;
  name: FormFieldName<TFieldValues, TValue>;
};

export function FormRadioGroup<
  TFieldValues extends FieldValues,
  TValue = string
>({
  disabled = false,
  name,
  ...props
}: FormRadioGroupProps<TFieldValues, TValue>) {
  const { error, isDisabled, name: fieldName, onBlur, ref, setValue, value } =
    useFormField<TFieldValues, TValue, HTMLInputElement>(name, disabled);

  return (
    <RadioGroup
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
