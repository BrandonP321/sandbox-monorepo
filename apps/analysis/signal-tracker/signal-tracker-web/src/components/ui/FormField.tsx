import type * as React from "react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

let nextFormFieldId = 1;

type FormFieldControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  id: string;
};

type FormFieldProps = {
  children: (controlProps: FormFieldControlProps) => React.ReactNode;
  className?: string;
  description?: string;
  error?: string;
  id?: string;
  label: string;
  required?: boolean;
};

function FormField({
  children,
  className,
  description,
  error,
  id,
  label,
  required = false
}: FormFieldProps) {
  const generatedIdRef = useRef<string | null>(null);

  if (!generatedIdRef.current) {
    generatedIdRef.current = `form-field-${nextFormFieldId}`;
    nextFormFieldId += 1;
  }

  const controlId = id ?? generatedIdRef.current;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div className={cn("grid gap-2", className)} data-slot="form-field">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" htmlFor={controlId}>
          {label}
        </label>
        {required ? (
          <span className="text-muted-foreground text-xs font-medium">
            Required
          </span>
        ) : null}
      </div>
      {children({
        id: controlId,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : undefined
      })}
      {description ? (
        <p className="text-muted-foreground text-sm" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="text-destructive text-sm font-medium" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FormField, type FormFieldControlProps, type FormFieldProps };
