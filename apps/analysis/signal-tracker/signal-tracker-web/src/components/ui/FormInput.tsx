import {
  FormInputControl,
  type FormFieldName,
  type FormInputControlRenderProps
} from "@repo/ui-base";
import type { FieldValues } from "react-hook-form";

import { FormField } from "./FormField";
import { Input, type InputProps } from "./Input";

type FormInputProps<TFieldValues extends FieldValues> = Pick<
  InputProps,
  "placeholder" | "required" | "type"
> & {
  className?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  inputClassName?: string;
  label: string;
  name: FormFieldName<TFieldValues, string>;
};

function FormInput<TFieldValues extends FieldValues>({
  className,
  description,
  disabled = false,
  id,
  inputClassName,
  label,
  name,
  placeholder,
  required,
  type = "text"
}: FormInputProps<TFieldValues>) {
  return (
    <FormInputControl<TFieldValues> disabled={disabled} id={id} name={name}>
      {({ error, ref, ...controlProps }: FormInputControlRenderProps) => (
        <FormField
          className={className}
          description={description}
          error={error}
          id={controlProps.id}
          label={label}
          required={required ?? controlProps.required}
        >
          {(fieldProps) => (
            <Input
              {...fieldProps}
              className={inputClassName}
              disabled={controlProps.disabled}
              name={controlProps.name}
              onBlur={controlProps.onBlur}
              onChange={controlProps.onChange}
              placeholder={placeholder}
              ref={ref}
              required={required ?? controlProps.required}
              type={type}
              value={controlProps.value}
            />
          )}
        </FormField>
      )}
    </FormInputControl>
  );
}

export { FormInput, type FormInputProps };
