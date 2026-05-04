import {
  Form as BaseForm,
  type FormProps as BaseFormProps
} from "@repo/ui-base";
import type { FieldValues } from "react-hook-form";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Alert } from "../Alert";

type FormProps<T extends FieldValues> = BaseFormProps<T> & {
  actions?: ReactNode;
  error?: string;
  errorTitle?: string;
};

function Form<T extends FieldValues>({
  actions,
  children,
  className,
  error,
  errorTitle,
  ...props
}: FormProps<T>) {
  return (
    <BaseForm {...props} className={cn("grid gap-4", className)}>
      {children}
      {error ? (
        <Alert title={errorTitle} variant="danger">
          {error}
        </Alert>
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
