import { useId } from "react";
import type { FieldValues } from "react-hook-form";

import {
  type FormControlChildren,
  type FormControlRenderPropsBase
} from "../FormControl.types";
import { type FormFieldName, useFormField } from "../../form/useFormField";

export type FormDropdownControlRenderProps<TValue = string> =
  FormControlRenderPropsBase<HTMLSelectElement> & {
  onValueChange: (value: TValue | undefined) => void;
  value: TValue | undefined;
  };

export type FormDropdownControlProps<
  TFieldValues extends FieldValues,
  TValue = string
> = {
  children: FormControlChildren<FormDropdownControlRenderProps<TValue>>;
  disabled?: boolean;
  id?: string;
  name: FormFieldName<TFieldValues, TValue>;
};

export function FormDropdownControl<
  TFieldValues extends FieldValues,
  TValue = string
>({
  children,
  disabled = false,
  id,
  name
}: FormDropdownControlProps<TFieldValues, TValue>) {
  const generatedId = useId();
  const {
    error,
    isDisabled,
    name: fieldName,
    onBlur,
    ref,
    setValue,
    value
  } = useFormField<TFieldValues, TValue, HTMLSelectElement>(name, disabled);
  const inputId = id ?? `select-${generatedId}`;

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
