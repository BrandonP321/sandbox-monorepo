import {
  forwardRef,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  useId
} from "react";

import { normalizeComparableValue } from "../../../lib/normalizeComparableValue";
import { useControllableValue } from "../../../lib/useControllableValue";
import {
  FormField,
  type FormFieldContentProps
} from "../FormField/FormField";
import styles from "./CheckboxGroup.module.scss";

export type CheckboxOption<TValue = string> = {
  disabled?: boolean;
  label: ReactNode;
  value: TValue;
};

export type CheckboxGroupProps<TValue = string> = FormFieldContentProps & {
  defaultValue?: readonly TValue[] | null;
  disabled?: boolean;
  error?: string;
  id?: string;
  name?: string;
  onBlur?: InputHTMLAttributes<HTMLInputElement>["onBlur"];
  onValueChange?: (value: TValue[]) => void;
  options: readonly CheckboxOption<TValue>[];
  value?: readonly TValue[] | null;
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

type CheckboxGroupComponent = <TValue = string>(
  props: CheckboxGroupProps<TValue> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

function CheckboxGroupInner<TValue = string>(
  props: CheckboxGroupProps<TValue>,
  ref: ForwardedRef<HTMLInputElement>
) {
  const isValueControlled = Object.prototype.hasOwnProperty.call(props, "value");
  const {
    defaultValue,
    description,
    disabled = false,
    error,
    id,
    label,
    name,
    onBlur,
    onValueChange,
    options,
    value
  } = props;
  const generatedId = useId();
  const inputId = id ?? `checkbox-group-${generatedId}`;
  const groupName = name ?? inputId;
  const [selectedValues, setSelectedValues] = useControllableValue<
    readonly TValue[]
  >({
    defaultValue: defaultValue ?? [],
    isControlled: isValueControlled,
    onChange: (nextValue) => onValueChange?.([...nextValue]),
    value: Array.isArray(value) ? value : []
  });

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
                disabled={disabled || option.disabled}
                id={optionId}
                name={groupName}
                ref={index === 0 ? ref : undefined}
                type="checkbox"
                onBlur={onBlur}
                onChange={(event) => {
                  if (event.currentTarget.checked) {
                    setSelectedValues([...selectedValues, option.value]);
                    return;
                  }

                  setSelectedValues(
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

const CheckboxGroupBase = forwardRef(CheckboxGroupInner);

CheckboxGroupBase.displayName = "CheckboxGroup";

export const CheckboxGroup = CheckboxGroupBase as CheckboxGroupComponent;
