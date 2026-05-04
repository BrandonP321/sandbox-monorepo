import {
  Form as BaseForm,
  type FormProps as BaseFormProps
} from "@repo/ui-base";
import type { FieldValues } from "react-hook-form";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormProps<T extends FieldValues> = BaseFormProps<T> & {
  actions?: ReactNode;
  error?: string;
};

function Form<T extends FieldValues>({
  actions,
  children,
  className,
  error,
  ...props
}: FormProps<T>) {
  return (
    <BaseForm {...props} className={cn("grid gap-4", className)}>
      {children}
      {error ? (
        <p className="text-danger text-sm font-medium" role="alert">
          {error}
        </p>
      ) : null}
      {actions ? (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {actions}
        </div>
      ) : null}
    </BaseForm>
  );
}

export { Form, type FormProps };
