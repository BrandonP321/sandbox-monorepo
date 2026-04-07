import { useState } from "react";

type UseControllableValueParams<TValue> = {
  defaultValue: TValue;
  isControlled: boolean;
  onChange?: (value: TValue) => void;
  value: TValue;
};

export function useControllableValue<TValue>({
  defaultValue,
  isControlled,
  onChange,
  value
}: UseControllableValueParams<TValue>) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = (nextValue: TValue) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue);
  };

  return [currentValue, setValue] as const;
}
