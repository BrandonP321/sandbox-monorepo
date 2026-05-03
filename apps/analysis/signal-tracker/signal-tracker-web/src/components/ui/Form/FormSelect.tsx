import { FormDropdownControl, type FormFieldName } from "@repo/ui-base";
import type { FieldValues } from "react-hook-form";

import { FormField } from "./FormField";
import { Select, type SelectOption, type SelectProps } from "../Select";

type FormSelectProps<TFieldValues extends FieldValues> = Pick<
  SelectProps,
  "placeholder" | "required"
> & {
  className?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  label: string;
  name: FormFieldName<TFieldValues, string>;
  options: SelectOption[];
  selectClassName?: string;
};

function FormSelect<TFieldValues extends FieldValues>({
  className,
  description,
  disabled = false,
  id,
  label,
  name,
  options,
  placeholder,
  required,
  selectClassName
}: FormSelectProps<TFieldValues>) {
  return (
    <FormDropdownControl<TFieldValues> disabled={disabled} id={id} name={name}>
      {({ error, onValueChange, ref, ...controlProps }) => (
        <FormField
          className={className}
          description={description}
          error={error}
          id={controlProps.id}
          label={label}
          required={required ?? controlProps.required}
        >
          {(fieldProps) => (
            <Select
              {...fieldProps}
              className={selectClassName}
              disabled={controlProps.disabled}
              name={controlProps.name}
              onBlur={controlProps.onBlur}
              onChange={(event) => onValueChange(event.currentTarget.value)}
              options={options}
              placeholder={placeholder}
              ref={ref}
              required={required ?? controlProps.required}
              value={controlProps.value ?? ""}
            />
          )}
        </FormField>
      )}
    </FormDropdownControl>
  );
}

export { FormSelect, type FormSelectProps };
