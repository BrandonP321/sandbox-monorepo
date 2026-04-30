import type { FieldValues } from "react-hook-form";

import {
  FormRadioGroupControl,
  type FormFieldName,
  type FormRadioGroupControlRenderProps
} from "@repo/ui-base";

import { RadioGroup, type RadioGroupProps } from "./RadioGroup";

export type FormRadioGroupProps<
  TFieldValues extends FieldValues,
  TValue = string
> = Omit<
  RadioGroupProps<TValue>,
  "defaultValue" | "error" | "name" | "onBlur" | "onValueChange" | "value"
> & {
  disabled?: boolean;
  name: FormFieldName<TFieldValues, TValue>;
};

export function FormRadioGroup<
  TFieldValues extends FieldValues,
  TValue = string
>({
  disabled = false,
  id,
  name,
  ...props
}: FormRadioGroupProps<TFieldValues, TValue>) {
  return (
    <FormRadioGroupControl disabled={disabled} id={id} name={name}>
      {({
        ref,
        ...radioGroupProps
      }: FormRadioGroupControlRenderProps<TValue>) => (
        <RadioGroup {...props} {...radioGroupProps} ref={ref} />
      )}
    </FormRadioGroupControl>
  );
}
