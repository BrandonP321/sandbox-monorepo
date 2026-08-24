import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { classNames } from "./classNames";

type TextInputProps = ComponentPropsWithoutRef<"input">;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ className, ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        className={classNames("ui-text-input", className)}
      />
    );
  }
);

type TextareaProps = ComponentPropsWithoutRef<"textarea">;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        {...props}
        ref={ref}
        className={classNames("ui-textarea", className)}
      />
    );
  }
);

export { Textarea, TextInput, type TextareaProps, type TextInputProps };
