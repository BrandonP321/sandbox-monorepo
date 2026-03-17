import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import { normalizeComparableValue } from "../../../lib/normalizeComparableValue";
import { FormField, type FormFieldContentProps } from "../Input/FormField";
import { type FormFieldName, useFormField } from "../Input/useFormField";

export type RadioOption<TValue = string> = {
  disabled?: boolean;
  label: ReactNode;
  value: TValue;
};

export type RadioGroupProps<
  TFieldValues extends FieldValues,
  TValue = string
> = FormFieldContentProps & {
  disabled?: boolean;
  name: FormFieldName<TFieldValues, TValue>;
  options: readonly RadioOption<TValue>[];
};

export function RadioGroup<
  TFieldValues extends FieldValues,
  TValue = string
>({
  description,
  disabled = false,
  label,
  name,
  options
}: RadioGroupProps<TFieldValues, TValue>) {
  const {
    error,
    inputId,
    isDisabled,
    name: fieldName,
    onBlur,
    ref,
    setValue,
    value
  } = useFormField<TFieldValues, TValue, HTMLInputElement>(name, disabled);

  return (
    <FormField description={description} error={error} isFieldset label={label}>
      <div className="ui-radio-group">
        {options.map((option, index) => {
          const optionId = `${inputId}-${index}`;
          const checked =
            normalizeComparableValue(option.value) ===
            normalizeComparableValue(value);

          return (
            <div className="ui-radio-control" key={String(index)}>
              <input
                checked={checked}
                className="ui-radio-input"
                disabled={isDisabled || option.disabled}
                id={optionId}
                name={fieldName}
                ref={index === 0 ? ref : undefined}
                type="radio"
                onBlur={onBlur}
                onChange={() => setValue(option.value)}
              />
              <label className="ui-radio-label" htmlFor={optionId}>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </FormField>
  );
}

RadioGroup.displayName = "RadioGroup";
