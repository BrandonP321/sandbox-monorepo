import type { FieldValues } from "react-hook-form";

import {
  type FormFieldName,
  useFormField
} from "../FormField/useFormField";
import { Input, type InputProps } from "./Input";

export type FormInputProps<TFieldValues extends FieldValues> = Omit<
  InputProps,
  "defaultValue" | "error" | "name" | "onBlur" | "onChange" | "value"
> & {
  disabled?: boolean;
  name: FormFieldName<TFieldValues, string>;
};

export function FormInput<TFieldValues extends FieldValues>({
  disabled = false,
  name,
  ...props
}: FormInputProps<TFieldValues>) {
  const { error, isDisabled, name: fieldName, onBlur, ref, setValue, value } =
    useFormField<TFieldValues, string>(name, disabled);

  return (
    <Input
      {...props}
      disabled={isDisabled}
      error={error}
      name={fieldName}
      ref={ref}
      value={value ?? ""}
      onBlur={onBlur}
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  );
}
