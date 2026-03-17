import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import { normalizeComparableValue } from "../../../lib/normalizeComparableValue";
import {
  FormField,
  type FormFieldContentProps
} from "../FormField/FormField";
import {
  type FormFieldName,
  useFormField
} from "../FormField/useFormField";
import styles from "./CheckboxGroup.module.scss";

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
      <div className={styles.group}>
        {options.map((option, index) => {
          const optionId = `${inputId}-${index}`;
          const checked = includesOptionValue(selectedValues, option.value);

          return (
            <div className={styles.control} key={String(index)}>
              <input
                aria-invalid={error ? true : undefined}
                checked={checked}
                className={styles.input}
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
              <label className={styles.label} htmlFor={optionId}>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </FormField>
  );
}
