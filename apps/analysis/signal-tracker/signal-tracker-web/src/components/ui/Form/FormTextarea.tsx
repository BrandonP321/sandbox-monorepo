import {
  FormTextareaControl,
  type FormFieldName,
  type FormTextareaControlRenderProps
} from "@repo/ui-base";
import type { FieldValues } from "react-hook-form";

import { FormField } from "./FormField";
import { Textarea, type TextareaProps } from "../Textarea";

type FormTextareaProps<TFieldValues extends FieldValues> = Pick<
  TextareaProps,
  "placeholder" | "required" | "rows"
> & {
  className?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  label: string;
  name: FormFieldName<TFieldValues, string>;
  textareaClassName?: string;
};

function FormTextarea<TFieldValues extends FieldValues>({
  className,
  description,
  disabled = false,
  id,
  label,
  name,
  placeholder,
  required,
  rows,
  textareaClassName
}: FormTextareaProps<TFieldValues>) {
  return (
    <FormTextareaControl<TFieldValues> disabled={disabled} id={id} name={name}>
      {({ error, ref, ...controlProps }: FormTextareaControlRenderProps) => (
        <FormField
          className={className}
          description={description}
          error={error}
          id={controlProps.id}
          label={label}
          required={required ?? controlProps.required}
        >
          {(fieldProps) => (
            <Textarea
              {...fieldProps}
              className={textareaClassName}
              disabled={controlProps.disabled}
              name={controlProps.name}
              onBlur={controlProps.onBlur}
              onChange={controlProps.onChange}
              placeholder={placeholder}
              ref={ref}
              required={required ?? controlProps.required}
              rows={rows}
              value={controlProps.value}
            />
          )}
        </FormField>
      )}
    </FormTextareaControl>
  );
}

export { FormTextarea, type FormTextareaProps };
