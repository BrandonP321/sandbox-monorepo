import type * as React from "react";

import { cn } from "../../../lib/utils";

import { textInputClassName } from "../form-control-styles";

type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

type SelectNativeProps = Pick<
  React.ComponentPropsWithRef<"select">,
  | "aria-label"
  | "aria-describedby"
  | "aria-invalid"
  | "className"
  | "disabled"
  | "id"
  | "name"
  | "onBlur"
  | "onChange"
  | "ref"
  | "required"
  | "value"
>;

type SelectProps = SelectNativeProps & {
  options: SelectOption[];
  placeholder?: string;
};

function Select({
  className,
  options,
  placeholder,
  ...selectProps
}: SelectProps) {
  return (
    <select
      {...selectProps}
      data-slot="select"
      className={cn(textInputClassName, className)}
    >
      {placeholder ? (
        <option value="" disabled={selectProps.required}>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option
          disabled={option.disabled}
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

export { Select, type SelectOption, type SelectProps };
