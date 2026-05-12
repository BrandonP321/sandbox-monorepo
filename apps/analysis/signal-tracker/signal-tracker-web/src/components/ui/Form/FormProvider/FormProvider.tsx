import { FormProvider as BaseFormProvider } from "@repo/ui-base";
import type { PropsWithChildren } from "react";
import type { UseFormProps } from "react-hook-form";
import { z, type ZodObject, type ZodRawShape } from "zod";

import { ErrorNotificationProvider } from "../../Notifications";

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
    // TODO: Merge this wrapper with the ui-base FormProvider when components/ui migrates to a shared package.
    <ErrorNotificationProvider>
      <BaseFormProvider {...props}>{children}</BaseFormProvider>
    </ErrorNotificationProvider>
  );
}

export { FormProvider };
export type { FormProviderProps };
