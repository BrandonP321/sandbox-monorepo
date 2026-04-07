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
import styles from "./RadioGroup.module.scss";

export type RadioOption<TValue = string> = {
  disabled?: boolean;
  label: ReactNode;
  value: TValue;
};

export type RadioGroupProps<TValue = string> = FormFieldContentProps & {
  defaultValue?: TValue | null;
  disabled?: boolean;
  error?: string;
  id?: string;
  name?: string;
  onBlur?: InputHTMLAttributes<HTMLInputElement>["onBlur"];
  onValueChange?: (value: TValue) => void;
  options: readonly RadioOption<TValue>[];
  value?: TValue | null;
};

type RadioGroupComponent = <TValue = string>(
  props: RadioGroupProps<TValue> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

function RadioGroupInner<TValue = string>(
  props: RadioGroupProps<TValue>,
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
  const inputId = id ?? `radio-group-${generatedId}`;
  const groupName = name ?? inputId;
  const [selectedValue, setSelectedValue] = useControllableValue<
    TValue | null | undefined
  >({
    defaultValue: defaultValue ?? undefined,
    isControlled: isValueControlled,
    onChange: (nextValue) => {
      if (nextValue === null || nextValue === undefined) {
        return;
      }

      onValueChange?.(nextValue);
    },
    value: value ?? undefined
  });

  return (
    <FormField description={description} error={error} isFieldset label={label}>
      <div className={styles.group}>
        {options.map((option, index) => {
          const optionId = `${inputId}-${index}`;
          const checked =
            normalizeComparableValue(option.value) ===
            normalizeComparableValue(selectedValue);

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
                type="radio"
                onBlur={onBlur}
                onChange={() => setSelectedValue(option.value)}
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

const RadioGroupBase = forwardRef(RadioGroupInner);

RadioGroupBase.displayName = "RadioGroup";

export const RadioGroup = RadioGroupBase as RadioGroupComponent;
