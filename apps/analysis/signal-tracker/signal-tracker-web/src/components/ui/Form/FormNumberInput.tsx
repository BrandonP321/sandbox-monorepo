import type { ChangeEvent } from "react";
import { useFormSchemaMetadata } from "@repo/ui-base";
import type { FieldValues } from "react-hook-form";

import { FormInputBase, type FormInputBaseCommonProps } from "./FormInputBase";
import { NumberInput, type NumberInputProps } from "../Input";

type FormNumberInputProps<TFieldValues extends FieldValues> = Pick<
  NumberInputProps,
  "max" | "min" | "placeholder" | "step"
> &
  FormInputBaseCommonProps<TFieldValues, number>;

function FormNumberInput<TFieldValues extends FieldValues>({
  max,
  min,
  placeholder,
  step,
  ...formInputProps
}: FormNumberInputProps<TFieldValues>) {
  const { numericFieldConstraintsByName } = useFormSchemaMetadata();
  const numericConstraints = numericFieldConstraintsByName.get(
    formInputProps.name
  );

  return (
    <FormInputBase<TFieldValues, number, number | "">
      {...formInputProps}
      formatValue={formatNumberInputValue}
      parseValue={parseNumberInputValue}
    >
      {(inputProps) => (
        <NumberInput
          {...inputProps}
          max={max ?? numericConstraints?.max}
          min={min ?? numericConstraints?.min}
          placeholder={placeholder}
          step={step}
        />
      )}
    </FormInputBase>
  );
}

function formatNumberInputValue(value: number | null | undefined) {
  return value ?? "";
}

function parseNumberInputValue(
  event: ChangeEvent<HTMLInputElement>
): number | undefined {
  if (event.currentTarget.value === "") {
    return undefined;
  }

  const nextValue = event.currentTarget.valueAsNumber;

  return Number.isFinite(nextValue) ? nextValue : undefined;
}

export { FormNumberInput, type FormNumberInputProps };
