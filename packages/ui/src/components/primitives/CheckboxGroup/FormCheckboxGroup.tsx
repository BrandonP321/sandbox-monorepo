import type { FieldValues } from "react-hook-form";

import {
  FormCheckboxGroupControl,
  type FormCheckboxGroupControlRenderProps,
  type FormFieldName
} from "@repo/ui-base";

import { CheckboxGroup, type CheckboxGroupProps } from "./CheckboxGroup";

export type FormCheckboxGroupProps<
  TFieldValues extends FieldValues,
  TValue = string
> = Omit<
  CheckboxGroupProps<TValue>,
  "defaultValue" | "error" | "name" | "onBlur" | "onValueChange" | "value"
> & {
  disabled?: boolean;
  name: FormFieldName<TFieldValues, TValue[]>;
};

export function FormCheckboxGroup<
  TFieldValues extends FieldValues,
  TValue = string
>({
  disabled = false,
  id,
  name,
  ...props
}: FormCheckboxGroupProps<TFieldValues, TValue>) {
  return (
    <FormCheckboxGroupControl disabled={disabled} id={id} name={name}>
      {({
        ref,
        ...checkboxGroupProps
      }: FormCheckboxGroupControlRenderProps<TValue>) => (
        <CheckboxGroup {...props} {...checkboxGroupProps} ref={ref} />
      )}
    </FormCheckboxGroupControl>
  );
}
