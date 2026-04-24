import { useId } from "react";
import type { ChangeEventHandler } from "react";
import type { FieldValues } from "react-hook-form";

import {
  type FormControlChildren,
  type FormControlRenderPropsBase
} from "../FormControl.types";
import { type FormFieldName, useFormField } from "../../form/useFormField";

export type FormInputControlRenderProps = FormControlRenderPropsBase<HTMLInputElement> & {
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
};

export type FormInputControlProps<TFieldValues extends FieldValues> = {
  children: FormControlChildren<FormInputControlRenderProps>;
  disabled?: boolean;
  id?: string;
  name: FormFieldName<TFieldValues, string>;
};

export function FormInputControl<TFieldValues extends FieldValues>({
  children,
  disabled = false,
  id,
  name
}: FormInputControlProps<TFieldValues>) {
  const generatedId = useId();
  const {
    error,
    isDisabled,
    name: fieldName,
    onBlur,
    ref,
    setValue,
    value
  } = useFormField<TFieldValues, string>(name, disabled);
  const inputId = id ?? `input-${generatedId}`;

  return children({
    disabled: isDisabled,
    error,
    id: inputId,
    ref,
    name: fieldName,
    onBlur,
    onChange: (event) => setValue(event.currentTarget.value),
    value: value ?? ""
  });
}
