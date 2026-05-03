import { useId } from "react";
import type { ChangeEventHandler } from "react";
import type { FieldValues } from "react-hook-form";

import {
  type FormControlChildren,
  type FormControlRenderPropsBase
} from "../FormControl.types";
import { type FormFieldName, useFormField } from "../../form/useFormField";

export type FormTextareaControlRenderProps =
  FormControlRenderPropsBase<HTMLTextAreaElement> & {
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
    required: boolean;
    value: string;
  };

export type FormTextareaControlProps<TFieldValues extends FieldValues> = {
  children: FormControlChildren<FormTextareaControlRenderProps>;
  disabled?: boolean;
  id?: string;
  name: FormFieldName<TFieldValues, string>;
};

export function FormTextareaControl<TFieldValues extends FieldValues>({
  children,
  disabled = false,
  id,
  name
}: FormTextareaControlProps<TFieldValues>) {
  const generatedId = useId();
  const {
    error,
    isDisabled,
    isRequired,
    name: fieldName,
    onBlur,
    ref,
    setValue,
    value
  } = useFormField<TFieldValues, string, HTMLTextAreaElement>(name, disabled);
  const textareaId = id ?? `textarea-${generatedId}`;

  return children({
    disabled: isDisabled,
    error,
    id: textareaId,
    ref,
    name: fieldName,
    onBlur,
    onChange: (event) => setValue(event.currentTarget.value),
    required: isRequired,
    value: value ?? ""
  });
}
