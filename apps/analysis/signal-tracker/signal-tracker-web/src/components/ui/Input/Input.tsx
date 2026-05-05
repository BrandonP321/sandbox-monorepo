import type * as React from "react";

import { cn } from "@/lib/utils";

type SharedNativeInputProps = Pick<
  React.ComponentPropsWithRef<"input">,
  | "aria-describedby"
  | "aria-invalid"
  | "className"
  | "disabled"
  | "id"
  | "name"
  | "onBlur"
  | "onChange"
  | "placeholder"
  | "ref"
  | "required"
>;

type NumberInputSpecificProps = Pick<
  React.ComponentPropsWithRef<"input">,
  "max" | "min" | "step"
> & {
  type: "number";
  value?: number | "";
};

type DateInputSpecificProps = Pick<
  React.ComponentPropsWithRef<"input">,
  "max" | "min"
> & {
  type: "date";
  value?: string;
};

type TextInputNativeProps = SharedNativeInputProps & {
  type?: "email" | "password" | "search" | "text" | "url";
  value?: string;
};

type DateInputNativeProps = SharedNativeInputProps & DateInputSpecificProps;

type NumberInputNativeProps = SharedNativeInputProps & NumberInputSpecificProps;

type InputProps =
  | DateInputNativeProps
  | NumberInputNativeProps
  | TextInputNativeProps;

function Input({ className, type = "text", ...inputProps }: InputProps) {
  return (
    <input
      {...inputProps}
      data-slot="input"
      type={type}
      className={cn(
        "border-input bg-background text-foreground placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-danger aria-invalid:ring-danger/20",
        "flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}

export {
  Input,
  type DateInputNativeProps,
  type InputProps,
  type NumberInputNativeProps,
  type TextInputNativeProps
};
