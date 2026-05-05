import { useId } from "react";
import type { ChangeEvent, ChangeEventHandler, ReactNode } from "react";
import { type FormFieldName, useFormField } from "@repo/ui-base";
import { type FieldValues, useWatch } from "react-hook-form";

import { FormField, type FormFieldControlProps } from "./FormField";

type FormInputBaseDisplayValue = number | string;

type FormInputBaseCommonProps<TFieldValues extends FieldValues, TValue> = {
  className?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  inputClassName?: string;
  label: string;
  name: FormFieldName<TFieldValues, TValue>;
  required?: boolean;
};

type FormInputBaseRenderProps<
  TDisplayValue extends FormInputBaseDisplayValue = FormInputBaseDisplayValue
> = FormFieldControlProps & {
  className?: string;
  disabled: boolean;
  name: string;
  onBlur: () => void;
  onChange: ChangeEventHandler<HTMLInputElement>;
  ref: (instance: HTMLInputElement | null) => void;
  required: boolean;
  value: TDisplayValue;
};

type FormInputBaseProps<
  TFieldValues extends FieldValues,
  TValue,
  TDisplayValue extends FormInputBaseDisplayValue
> = FormInputBaseCommonProps<TFieldValues, TValue> & {
  children: (inputProps: FormInputBaseRenderProps<TDisplayValue>) => ReactNode;
  formatValue: (value: TValue | null | undefined) => TDisplayValue;
  parseValue: (event: ChangeEvent<HTMLInputElement>) => TValue | undefined;
};

function FormInputBase<
  TFieldValues extends FieldValues,
  TValue,
  TDisplayValue extends FormInputBaseDisplayValue
>({
  children,
  className,
  description,
  disabled = false,
  formatValue,
  id,
  inputClassName,
  label,
  name,
  parseValue,
  required
}: FormInputBaseProps<TFieldValues, TValue, TDisplayValue>) {
  const generatedId = useId();
  const {
    error,
    isDisabled,
    isRequired,
    name: fieldName,
    onBlur,
    ref,
    setValue
  } = useFormField<TFieldValues, TValue, HTMLInputElement>(name, disabled);
  const value = useWatch<TFieldValues>({ name }) as TValue | null | undefined;
  const inputId = id ?? `input-${generatedId}`;
  const isFieldRequired = required ?? isRequired;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(parseValue(event));
  }

  return (
    <FormField
      className={className}
      description={description}
      error={error}
      id={inputId}
      label={label}
      required={isFieldRequired}
    >
      {(fieldProps) =>
        children({
          ...fieldProps,
          className: inputClassName,
          disabled: isDisabled,
          name: fieldName,
          onBlur,
          onChange: handleChange,
          ref,
          required: isFieldRequired,
          value: formatValue(value)
        })
      }
    </FormField>
  );
}

export {
  FormInputBase,
  type FormInputBaseCommonProps,
  type FormInputBaseDisplayValue
};
