import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider as RHFFormProvider,
  type UseFormProps,
  useForm
} from "react-hook-form";
import { z, type ZodObject, type ZodRawShape } from "zod";

import {
  createFormSchemaMetadata,
  FormSchemaMetadataContext
} from "../../form/FormSchemaMetadataContext";

type FormValues<TSchema extends ZodObject<ZodRawShape>> = z.input<TSchema>;

type FormProviderProps<TSchema extends ZodObject<ZodRawShape>> =
  React.PropsWithChildren<
    Omit<UseFormProps<FormValues<TSchema>>, "resolver">
  > & {
    schema: TSchema;
  };

export function FormProvider<TSchema extends ZodObject<ZodRawShape>>({
  children,
  schema,
  shouldFocusError = true,
  reValidateMode = "onChange",
  ...useFormParams
}: FormProviderProps<TSchema>) {
  const schemaMetadata = useMemo(
    () => createFormSchemaMetadata(schema),
    [schema]
  );
  const methods = useForm<FormValues<TSchema>>({
    ...useFormParams,
    reValidateMode,
    shouldFocusError,
    resolver: zodResolver(schema, undefined, { raw: true })
  });

  return (
    <FormSchemaMetadataContext.Provider value={schemaMetadata}>
      <RHFFormProvider {...methods}>{children}</RHFFormProvider>
    </FormSchemaMetadataContext.Provider>
  );
}
