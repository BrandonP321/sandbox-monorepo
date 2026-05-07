import type { ChangeEvent } from "react";
import type { FieldValues } from "react-hook-form";

import { FormInputBase, type FormInputBaseCommonProps } from "./FormInputBase";
import { TextInput, type TextInputProps } from "../Input";

type FormTextInputProps<TFieldValues extends FieldValues> = Pick<
  TextInputProps,
  "aria-label" | "placeholder" | "type"
> &
  FormInputBaseCommonProps<TFieldValues, string>;

function FormTextInput<TFieldValues extends FieldValues>({
  "aria-label": ariaLabel,
  placeholder,
  type = "text",
  ...formInputProps
}: FormTextInputProps<TFieldValues>) {
  return (
    <FormInputBase<TFieldValues, string, string>
      {...formInputProps}
      formatValue={formatTextInputValue}
      parseValue={parseTextInputValue}
    >
      {(inputProps) => (
        <TextInput
          {...inputProps}
          aria-label={ariaLabel}
          placeholder={placeholder}
          type={type}
        />
      )}
    </FormInputBase>
  );
}

function formatTextInputValue(value: string | null | undefined) {
  return value ?? "";
}

function parseTextInputValue(event: ChangeEvent<HTMLInputElement>) {
  return event.currentTarget.value;
}

export { FormTextInput, type FormTextInputProps };
