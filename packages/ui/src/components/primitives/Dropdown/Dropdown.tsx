import {
  forwardRef,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
  type SelectHTMLAttributes,
  useId
} from "react";

import { cn } from "../../../lib/cn";
import { normalizeComparableValue } from "../../../lib/normalizeComparableValue";
import { useControllableValue } from "../../../lib/useControllableValue";
import { FormField, type FormFieldContentProps } from "../FormField/FormField";
import styles from "./Dropdown.module.scss";

type NativeDropdownProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "defaultValue" | "multiple" | "value"
>;

export type DropdownOption<TValue = string> = {
  disabled?: boolean;
  label: string;
  value: TValue;
};

export type DropdownProps<TValue = string> = NativeDropdownProps &
  FormFieldContentProps & {
    defaultValue?: TValue | null;
    error?: string;
    options: readonly DropdownOption<TValue>[];
    placeholder?: string;
    value?: TValue | null;
    onValueChange?: (value: TValue | undefined) => void;
  };

type DropdownComponent = <TValue = string>(
  props: DropdownProps<TValue> & RefAttributes<HTMLSelectElement>
) => ReactElement | null;

function DropdownInner<TValue = string>(
  props: DropdownProps<TValue>,
  ref: ForwardedRef<HTMLSelectElement>
) {
  const isValueControlled = Object.prototype.hasOwnProperty.call(
    props,
    "value"
  );
  const {
    className,
    defaultValue,
    description,
    disabled = false,
    error,
    id,
    label,
    onChange,
    onValueChange,
    options,
    placeholder,
    required = false,
    value,
    ...restProps
  } = props;
  const generatedId = useId();
  const inputId = id ?? `input-${generatedId}`;
  const [selectedOptionValue, setSelectedOptionValue] = useControllableValue<
    TValue | undefined
  >({
    defaultValue: defaultValue ?? undefined,
    isControlled: isValueControlled,
    onChange: onValueChange,
    value: value ?? undefined
  });
  const selectedIndex = options.findIndex(
    (option) =>
      normalizeComparableValue(option.value) ===
      normalizeComparableValue(selectedOptionValue)
  );
  const selectValue = selectedIndex >= 0 ? String(selectedIndex) : "";

  return (
    <FormField
      description={description}
      error={error}
      id={inputId}
      label={label}
    >
      <select
        aria-invalid={error ? true : undefined}
        {...restProps}
        className={cn(styles.dropdown, className)}
        disabled={disabled}
        id={inputId}
        ref={ref}
        required={required}
        value={selectValue}
        onChange={(event) => {
          onChange?.(event);

          const nextIndex = event.currentTarget.value;

          if (nextIndex === "") {
            setSelectedOptionValue(undefined);
            return;
          }

          const option = options[Number(nextIndex)];

          setSelectedOptionValue(option?.value);
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

const DropdownBase = forwardRef(DropdownInner);

DropdownBase.displayName = "Dropdown";

export const Dropdown = DropdownBase as DropdownComponent;
