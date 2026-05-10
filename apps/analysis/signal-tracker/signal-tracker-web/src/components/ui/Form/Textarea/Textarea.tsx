import type * as React from "react";

import { cn } from "@/lib/utils";

import { textControlClassName } from "../form-control-styles";

type TextareaNativeProps = Pick<
  React.ComponentPropsWithRef<"textarea">,
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
  | "rows"
  | "value"
>;

type TextareaProps = TextareaNativeProps;

function Textarea({ className, rows = 4, ...textareaProps }: TextareaProps) {
  return (
    <textarea
      {...textareaProps}
      data-slot="textarea"
      rows={rows}
      className={cn(textControlClassName, "min-h-24", className)}
    />
  );
}

export { Textarea, type TextareaProps };
