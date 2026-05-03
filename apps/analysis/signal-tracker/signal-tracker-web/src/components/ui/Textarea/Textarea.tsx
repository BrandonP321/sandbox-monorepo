import type * as React from "react";

import { cn } from "@/lib/utils";

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
      className={cn(
        "border-input bg-background text-foreground placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "flex min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}

export { Textarea, type TextareaProps };
