import { useId } from "react";
import type { FieldValues } from "react-hook-form";

import {
  type FormControlChildren,
  type FormControlRenderPropsBase
} from "../FormControl.types";
import { type FormFieldName, useFormField } from "../../form/useFormField";

export type FormRadioGroupControlRenderProps<TValue = string> =
  FormControlRenderPropsBase<HTMLInputElement> & {
    onValueChange: (value: TValue) => void;
    value: TValue | undefined;
  };

export type FormRadioGroupControlProps<
  TFieldValues extends FieldValues,
  TValue = string
> = {
  children: FormControlChildren<FormRadioGroupControlRenderProps<TValue>>;
  disabled?: boolean;
  id?: string;
  name: FormFieldName<TFieldValues, TValue>;
};

export function FormRadioGroupControl<
  TFieldValues extends FieldValues,
  TValue = string
>({
  children,
  disabled = false,
  id,
  name
}: FormRadioGroupControlProps<TFieldValues, TValue>) {
  const generatedId = useId();
  const {
    error,
    isDisabled,
    name: fieldName,
    onBlur,
    ref,
    setValue,
    value
  } = useFormField<TFieldValues, TValue, HTMLInputElement>(name, disabled);
  const inputId = id ?? `radio-group-${generatedId}`;

  return children({
    disabled: isDisabled,
    error,
    id: inputId,
    name: fieldName,
    onBlur,
    onValueChange: setValue,
    ref,
    value: value ?? undefined
  });
}
