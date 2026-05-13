import { FormProvider as BaseFormProvider } from "@repo/ui-base";
import { ErrorNotificationProvider } from "@repo/ui-base/notifications";
import type { PropsWithChildren } from "react";
import type { UseFormProps } from "react-hook-form";
import { z, type ZodObject, type ZodRawShape } from "zod";

type FormValues<TSchema extends ZodObject<ZodRawShape>> = z.input<TSchema>;

type FormProviderProps<TSchema extends ZodObject<ZodRawShape>> =
  PropsWithChildren<Omit<UseFormProps<FormValues<TSchema>>, "resolver">> & {
    schema: TSchema;
  };

function FormProvider<TSchema extends ZodObject<ZodRawShape>>({
  children,
  ...props
}: FormProviderProps<TSchema>) {
  return (
    <ErrorNotificationProvider>
      <BaseFormProvider {...props}>{children}</BaseFormProvider>
    </ErrorNotificationProvider>
  );
}

export { FormProvider };
export type { FormProviderProps };
