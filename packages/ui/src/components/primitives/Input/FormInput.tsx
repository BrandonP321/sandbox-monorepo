import type { FieldValues } from "react-hook-form";

import {
  type FormFieldName,
  FormInputControl,
  type FormInputControlRenderProps
} from "@repo/ui-base";

import { InputView, type InputViewProps } from "./InputView";

type StyledFormInputProps = Omit<
  InputViewProps,
  | "defaultValue"
  | "error"
  | "id"
  | "name"
  | "onBlur"
  | "onChange"
  | "type"
  | "value"
> & {
  type?: InputViewProps["type"];
};

export type FormInputProps<TFieldValues extends FieldValues> =
  StyledFormInputProps & {
    disabled?: boolean;
    id?: string;
    name: FormFieldName<TFieldValues, string>;
  };

export function FormInput<TFieldValues extends FieldValues>({
  ariaLabel,
  description,
  disabled = false,
  iconLeft,
  id,
  label,
  name,
  placeholder,
  readOnly,
  required,
  type = "text"
}: FormInputProps<TFieldValues>) {
  return (
    <FormInputControl disabled={disabled} id={id} name={name}>
      {({ ref, ...inputProps }: FormInputControlRenderProps) => (
        <InputView
          {...inputProps}
          ariaLabel={ariaLabel}
          description={description}
          iconLeft={iconLeft}
          label={label}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={ref}
          required={required}
          type={type}
        />
      )}
    </FormInputControl>
  );
}
