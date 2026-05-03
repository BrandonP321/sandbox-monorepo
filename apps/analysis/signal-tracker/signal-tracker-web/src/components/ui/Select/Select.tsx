import type * as React from "react";

import { cn } from "@/lib/utils";

type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

type SelectNativeProps = Pick<
  React.ComponentPropsWithRef<"select">,
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
      className={cn(
        "border-input bg-background text-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
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
