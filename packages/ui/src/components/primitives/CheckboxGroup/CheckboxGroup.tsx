import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import { normalizeComparableValue } from "../../../lib/normalizeComparableValue";
import { FormField, type FormFieldContentProps } from "../Input/FormField";
import { type FormFieldName, useFormField } from "../Input/useFormField";

export type CheckboxOption<TValue = string> = {
  disabled?: boolean;
  label: ReactNode;
  value: TValue;
};

export type CheckboxGroupProps<
  TFieldValues extends FieldValues,
  TValue = string
> = FormFieldContentProps & {
  disabled?: boolean;
  name: FormFieldName<TFieldValues, TValue[]>;
  options: readonly CheckboxOption<TValue>[];
};

function includesOptionValue<TValue>(
  selectedValues: readonly TValue[],
  candidate: TValue
): boolean {
  const comparableCandidate = normalizeComparableValue(candidate);

  return selectedValues.some(
    (selectedValue) =>
      normalizeComparableValue(selectedValue) === comparableCandidate
  );
}

export function CheckboxGroup<
  TFieldValues extends FieldValues,
  TValue = string
>({
  description,
  disabled = false,
  label,
  name,
  options
}: CheckboxGroupProps<TFieldValues, TValue>) {
  const {
    error,
    inputId,
    isDisabled,
    name: fieldName,
    onBlur,
    ref,
    setValue,
    value
  } = useFormField<TFieldValues, TValue[], HTMLInputElement>(name, disabled);
  const selectedValues = Array.isArray(value) ? value : [];

  return (
    <FormField description={description} error={error} isFieldset label={label}>
      <div className="ui-checkbox-group">
        {options.map((option, index) => {
          const optionId = `${inputId}-${index}`;
          const checked = includesOptionValue(selectedValues, option.value);

          return (
            <div className="ui-checkbox-control" key={String(index)}>
              <input
                checked={checked}
                className="ui-checkbox-input"
                disabled={isDisabled || option.disabled}
                id={optionId}
                name={fieldName}
                ref={index === 0 ? ref : undefined}
                type="checkbox"
                onBlur={onBlur}
                onChange={(event) => {
                  if (event.currentTarget.checked) {
                    setValue([...selectedValues, option.value]);
                    return;
                  }

                  setValue(
                    selectedValues.filter(
                      (selectedValue) =>
                        normalizeComparableValue(selectedValue) !==
                        normalizeComparableValue(option.value)
                    )
                  );
                }}
              />
              <label className="ui-checkbox-label" htmlFor={optionId}>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </FormField>
  );
}
