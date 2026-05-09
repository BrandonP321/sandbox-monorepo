import { Input, type NumberInputNativeProps } from "../Input";

type NumberInputProps = Omit<NumberInputNativeProps, "type">;

function NumberInput({ max, min, placeholder, ...props }: NumberInputProps) {
  return (
    <Input
      {...props}
      max={max}
      min={min}
      placeholder={placeholder ?? createNumberInputPlaceholder({ max, min })}
      type="number"
    />
  );
}

export { NumberInput, type NumberInputProps };

function createNumberInputPlaceholder({
  max,
  min
}: Pick<NumberInputProps, "max" | "min">) {
  if (min !== undefined && max !== undefined) {
    return `${min}-${max}`;
  }

  if (min !== undefined) {
    return `≥ ${min}`;
  }

  if (max !== undefined) {
    return `≤ ${max}`;
  }

  return undefined;
}
