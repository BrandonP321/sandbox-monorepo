import { useId } from "react";
import type { FieldValues } from "react-hook-form";

import {
  type FormControlChildren,
  type FormControlRenderPropsBase
} from "../FormControl.types";
import { type FormFieldName, useFormField } from "../../form/useFormField";

export type FormCheckboxGroupControlRenderProps<TValue = string> =
  FormControlRenderPropsBase<HTMLInputElement> & {
    onValueChange: (value: TValue[]) => void;
    value: TValue[];
  };

export type FormCheckboxGroupControlProps<
  TFieldValues extends FieldValues,
  TValue = string
> = {
  children: FormControlChildren<FormCheckboxGroupControlRenderProps<TValue>>;
  disabled?: boolean;
  id?: string;
  name: FormFieldName<TFieldValues, TValue[]>;
};

export function FormCheckboxGroupControl<
  TFieldValues extends FieldValues,
  TValue = string
>({
  children,
  disabled = false,
  id,
  name
}: FormCheckboxGroupControlProps<TFieldValues, TValue>) {
  const generatedId = useId();
  const {
    error,
    isDisabled,
    name: fieldName,
    onBlur,
    ref,
    setValue,
    value
  } = useFormField<TFieldValues, TValue[], HTMLInputElement>(name, disabled);
  const inputId = id ?? `checkbox-group-${generatedId}`;

  return children({
    disabled: isDisabled,
    error,
    id: inputId,
    name: fieldName,
    onBlur,
    onValueChange: setValue,
    ref,
    value: Array.isArray(value) ? value : []
  });
}
