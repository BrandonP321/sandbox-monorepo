import type { FieldValues } from "react-hook-form";

import {
  FormDropdownControl,
  type FormDropdownControlRenderProps,
  type FormFieldName
} from "@repo/ui-base";

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
  id,
  name,
  ...props
}: FormDropdownProps<TFieldValues, TValue>) {
  return (
    <FormDropdownControl disabled={disabled} id={id} name={name}>
      {({
        ref,
        ...dropdownProps
      }: FormDropdownControlRenderProps<TValue>) => (
        <Dropdown {...props} {...dropdownProps} ref={ref} />
      )}
    </FormDropdownControl>
  );
}
