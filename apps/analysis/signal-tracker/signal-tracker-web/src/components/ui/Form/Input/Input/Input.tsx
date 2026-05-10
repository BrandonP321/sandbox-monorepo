import type * as React from "react";

import { cn } from "@/lib/utils";

import { textInputClassName } from "../../form-control-styles";

type SharedNativeInputProps = Pick<
  React.ComponentPropsWithRef<"input">,
  | "aria-label"
  | "aria-describedby"
  | "aria-invalid"
  | "className"
  | "disabled"
  | "id"
  | "name"
  | "onBlur"
  | "onChange"
  | "onPaste"
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
      className={cn(textInputClassName, className)}
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
