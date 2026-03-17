import { useId } from "react";
import {
  type FieldPathByValue,
  type FieldValues,
  useController,
  useFormContext
} from "react-hook-form";

type FormFieldValue<TValue> = TValue | null | undefined;

export type FormFieldName<
  TFieldValues extends FieldValues,
  TValue = string
> = FieldPathByValue<
  TFieldValues,
  FormFieldValue<TValue>
>;

export type UseFormFieldResult<
  TElement extends HTMLElement = HTMLElement,
  TValue = string
> = {
  error?: string;
  inputId: string;
  isDisabled: boolean;
  name: string;
  onBlur: () => void;
  ref: (instance: TElement | null) => void;
  setValue: (value: FormFieldValue<TValue>) => void;
  value: FormFieldValue<TValue>;
};

export function useFormField<
  TFieldValues extends FieldValues,
  TValue = string,
  TElement extends HTMLElement = HTMLInputElement,
  TName extends FormFieldName<TFieldValues, TValue> = FormFieldName<
    TFieldValues,
    TValue
  >
>(name: TName, disabled = false): UseFormFieldResult<TElement, TValue> {
  const generatedId = useId();
  const inputId = `input-${generatedId}`;
  const { control, formState } = useFormContext<TFieldValues>();
  const { field, fieldState } = useController<TFieldValues, TName>({
    control,
    name,
    disabled
  });

  return {
    error:
      typeof fieldState.error?.message === "string"
        ? fieldState.error.message
        : undefined,
    inputId,
    isDisabled: disabled || formState.isSubmitting,
    name: field.name,
    onBlur: field.onBlur,
    ref: field.ref as (instance: TElement | null) => void,
    setValue: (value) => field.onChange(value),
    value: (field.value as FormFieldValue<TValue>) ?? undefined
  };
}
