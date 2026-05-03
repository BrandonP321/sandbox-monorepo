import {
  type FieldPathByValue,
  type FieldValues,
  useController,
  useFormContext
} from "react-hook-form";

import { useFormSchemaMetadata } from "./FormSchemaMetadataContext";

type FormFieldValue<TValue> = TValue | null | undefined;

export type FormFieldName<
  TFieldValues extends FieldValues,
  TValue = string
> = FieldPathByValue<TFieldValues, FormFieldValue<TValue>>;

export type UseFormFieldResult<
  TElement extends HTMLElement = HTMLElement,
  TValue = string
> = {
  error?: string;
  isDisabled: boolean;
  isRequired: boolean;
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
  const { requiredFieldNames } = useFormSchemaMetadata();
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
    isDisabled: disabled || formState.isSubmitting,
    isRequired: requiredFieldNames.has(field.name),
    name: field.name,
    onBlur: field.onBlur,
    ref: field.ref as (instance: TElement | null) => void,
    setValue: (value) => field.onChange(value),
    value: (field.value as FormFieldValue<TValue>) ?? undefined
  };
}
