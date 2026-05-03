import { createContext, useContext } from "react";
import { z, type ZodObject, type ZodRawShape } from "zod";

type FormSchemaMetadata = {
  requiredFieldNames: ReadonlySet<string>;
};

const emptyFormSchemaMetadata: FormSchemaMetadata = {
  requiredFieldNames: new Set<string>()
};

export const FormSchemaMetadataContext = createContext<FormSchemaMetadata>(
  emptyFormSchemaMetadata
);

export function createFormSchemaMetadata(
  schema: ZodObject<ZodRawShape>
): FormSchemaMetadata {
  return {
    requiredFieldNames: collectRequiredFieldNames(schema)
  };
}

export function useFormSchemaMetadata() {
  return useContext(FormSchemaMetadataContext);
}

function collectRequiredFieldNames(schema: ZodObject<ZodRawShape>) {
  const requiredFieldNames = new Set<string>();

  collectRequiredPaths(schema, [], true, requiredFieldNames);

  return requiredFieldNames;
}

function collectRequiredPaths(
  schema: ZodObject<ZodRawShape>,
  parentPath: string[],
  parentIsRequired: boolean,
  requiredFieldNames: Set<string>
) {
  const shape = schema.shape as Record<string, z.ZodTypeAny>;

  for (const [key, fieldSchema] of Object.entries(shape)) {
    const path = [...parentPath, key];
    const isRequired =
      parentIsRequired && !fieldSchema.safeParse(undefined).success;

    if (isRequired) {
      requiredFieldNames.add(path.join("."));
    }

    const objectSchema = getObjectSchema(fieldSchema);

    if (objectSchema) {
      collectRequiredPaths(objectSchema, path, isRequired, requiredFieldNames);
    }
  }
}

function getObjectSchema(schema: z.ZodTypeAny) {
  if (schema instanceof z.ZodObject) {
    return schema;
  }

  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    const unwrappedSchema = schema.unwrap();

    if (unwrappedSchema instanceof z.ZodObject) {
      return unwrappedSchema;
    }
  }

  return null;
}
