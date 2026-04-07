import type { FieldValues } from "react-hook-form";

import {
  type FormFieldName,
  useFormField
} from "../FormField/useFormField";
import { Dropdown, type DropdownProps } from "./Dropdown";

export type FormDropdownProps<
  TFieldValues extends FieldValues,
  TValue = string
> = Omit<
  DropdownProps<TValue>,
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

export function FormDropdown<
  TFieldValues extends FieldValues,
  TValue = string
>({
  disabled = false,
  name,
  ...props
}: FormDropdownProps<TFieldValues, TValue>) {
  const { error, isDisabled, name: fieldName, onBlur, ref, setValue, value } =
    useFormField<TFieldValues, TValue, HTMLSelectElement>(name, disabled);

  return (
    <Dropdown
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
