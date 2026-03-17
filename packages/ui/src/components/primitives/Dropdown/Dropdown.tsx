import type { SelectHTMLAttributes } from "react";
import type { FieldValues } from "react-hook-form";

import { FormField, type FormFieldContentProps } from "../Input/FormField";
import { type FormFieldName, useFormField } from "../Input/useFormField";

type NativeDropdownPropKeys = "autoFocus" | "required";

type NativeDropdownProps = Pick<
  SelectHTMLAttributes<HTMLSelectElement>,
  NativeDropdownPropKeys
>;

export type DropdownOption<TValue = string> = {
  disabled?: boolean;
  label: string;
  value: TValue;
};

export type DropdownProps<
  TFieldValues extends FieldValues,
  TValue = string
> =
  NativeDropdownProps &
    FormFieldContentProps & {
      disabled?: boolean;
      name: FormFieldName<TFieldValues, TValue>;
      options: readonly DropdownOption<TValue>[];
      placeholder?: string;
    };

function normalizeComparableValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "object") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value.map((item) => normalizeComparableValue(item)));
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, entryValue]) => [key, normalizeComparableValue(entryValue)]);

  return JSON.stringify(entries);
}

export function Dropdown<
  TFieldValues extends FieldValues,
  TValue = string
>({
  description,
  disabled = false,
  label,
  name,
  options,
  placeholder,
  required = false,
  ...props
}: DropdownProps<TFieldValues, TValue>) {
  const { error, inputId, isDisabled, onBlur, ref, setValue, value } =
    useFormField<TFieldValues, TValue, HTMLSelectElement>(name, disabled);
  const selectedIndex = options.findIndex(
    (option) =>
      normalizeComparableValue(option.value) === normalizeComparableValue(value)
  );
  const selectedValue = selectedIndex >= 0 ? String(selectedIndex) : "";

  return (
    <FormField description={description} error={error} id={inputId} label={label}>
      <select
        {...props}
        className="ui-dropdown"
        disabled={isDisabled}
        id={inputId}
        name={name}
        ref={ref}
        required={required}
        value={selectedValue}
        onBlur={onBlur}
        onChange={(event) => {
          const nextIndex = event.currentTarget.value;

          if (nextIndex === "") {
            setValue(undefined);
            return;
          }

          const option = options[Number(nextIndex)];

          setValue(option?.value);
        }}
      >
        {placeholder ? (
          <option disabled={required} value="">
            {placeholder}
          </option>
        ) : null}
        {options.map((option, index) => (
          <option
            disabled={option.disabled}
            key={String(index)}
            value={String(index)}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
