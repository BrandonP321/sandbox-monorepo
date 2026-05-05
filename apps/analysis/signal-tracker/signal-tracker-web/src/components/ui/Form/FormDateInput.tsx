import type { ChangeEvent } from "react";
import type { FieldValues } from "react-hook-form";

import { FormInputBase, type FormInputBaseCommonProps } from "./FormInputBase";
import { DateInput, type DateInputProps } from "../Input";

type FormDateInputProps<TFieldValues extends FieldValues> = Pick<
  DateInputProps,
  "max" | "min"
> &
  FormInputBaseCommonProps<TFieldValues, string>;

function FormDateInput<TFieldValues extends FieldValues>({
  max,
  min,
  ...formInputProps
}: FormDateInputProps<TFieldValues>) {
  return (
    <FormInputBase<TFieldValues, string, string>
      {...formInputProps}
      formatValue={formatDateInputValue}
      parseValue={parseDateInputValue}
    >
      {(inputProps) => <DateInput {...inputProps} max={max} min={min} />}
    </FormInputBase>
  );
}

function formatDateInputValue(value: string | null | undefined) {
  return value ?? "";
}

function parseDateInputValue(event: ChangeEvent<HTMLInputElement>) {
  return event.currentTarget.value;
}

export { FormDateInput, type FormDateInputProps };
