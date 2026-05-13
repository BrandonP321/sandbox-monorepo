import {
  Form as BaseForm,
  type FormProps as BaseFormProps
} from "@repo/ui-base";
import { useNotifications } from "@repo/ui-base/notifications";
import type { FieldValues } from "react-hook-form";
import { useCallback, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Alert } from "../../Alert";
import { NotificationAlerts } from "../../Notifications";

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
  onSubmit,
  ...props
}: FormProps<T>) {
  const { clearNotifications } = useNotifications();
  const handleSubmit = useCallback<BaseFormProps<T>["onSubmit"]>(
    async (values, event) => {
      clearNotifications();
      await onSubmit(values, event);
    },
    [clearNotifications, onSubmit]
  );

  return (
    <BaseForm
      {...props}
      className={cn("grid gap-4", className)}
      onSubmit={handleSubmit}
    >
      {children}
      {error ? (
        <Alert title={errorTitle} variant="danger">
          {error}
        </Alert>
      ) : null}
      <NotificationAlerts />
      {actions ? (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {actions}
        </div>
      ) : null}
    </BaseForm>
  );
}

export { Form, type FormProps };
