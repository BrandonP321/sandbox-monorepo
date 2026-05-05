import { createContext, useContext } from "react";
import { z, type ZodObject, type ZodRawShape } from "zod";

type NumericFieldConstraints = {
  max?: number;
  min?: number;
};

type NumericCheckDefinition = {
  check?: string;
  inclusive?: unknown;
  value?: unknown;
};

type FormSchemaMetadata = {
  numericFieldConstraintsByName: ReadonlyMap<string, NumericFieldConstraints>;
  requiredFieldNames: ReadonlySet<string>;
};

const emptyFormSchemaMetadata: FormSchemaMetadata = {
  numericFieldConstraintsByName: new Map<string, NumericFieldConstraints>(),
  requiredFieldNames: new Set<string>()
};

export const FormSchemaMetadataContext = createContext<FormSchemaMetadata>(
  emptyFormSchemaMetadata
);

export function createFormSchemaMetadata(
  schema: ZodObject<ZodRawShape>
): FormSchemaMetadata {
  return {
    numericFieldConstraintsByName: collectNumericFieldConstraints(schema),
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

function collectNumericFieldConstraints(schema: ZodObject<ZodRawShape>) {
  const numericFieldConstraintsByName = new Map<
    string,
    NumericFieldConstraints
  >();

  collectNumericConstraints(schema, [], numericFieldConstraintsByName);

  return numericFieldConstraintsByName;
}

function collectNumericConstraints(
  schema: ZodObject<ZodRawShape>,
  parentPath: string[],
  numericFieldConstraintsByName: Map<string, NumericFieldConstraints>
) {
  const shape = schema.shape as Record<string, z.ZodTypeAny>;

  for (const [key, fieldSchema] of Object.entries(shape)) {
    const path = [...parentPath, key];
    const numberSchema = getNumberSchema(fieldSchema);

    if (numberSchema) {
      const constraints = getNumericFieldConstraints(numberSchema);

      if (constraints) {
        numericFieldConstraintsByName.set(path.join("."), constraints);
      }
    }

    const objectSchema = getObjectSchema(fieldSchema);

    if (objectSchema) {
      collectNumericConstraints(
        objectSchema,
        path,
        numericFieldConstraintsByName
      );
    }
  }
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
  const unwrappedSchema = unwrapSchema(schema);

  if (unwrappedSchema instanceof z.ZodObject) {
    return unwrappedSchema;
  }

  return null;
}

function getNumberSchema(schema: z.ZodTypeAny) {
  const unwrappedSchema = unwrapSchema(schema);

  if (unwrappedSchema instanceof z.ZodNumber) {
    return unwrappedSchema;
  }

  return null;
}

function getNumericFieldConstraints(schema: z.ZodNumber) {
  const constraints: NumericFieldConstraints = {};

  for (const check of schema._def.checks ?? []) {
    const checkDefinition = getNumericCheckDefinition(check);

    if (!checkDefinition || checkDefinition.inclusive !== true) {
      continue;
    }

    if (
      checkDefinition.check === "greater_than" &&
      typeof checkDefinition.value === "number"
    ) {
      constraints.min =
        constraints.min === undefined
          ? checkDefinition.value
          : Math.max(constraints.min, checkDefinition.value);
    }

    if (
      checkDefinition.check === "less_than" &&
      typeof checkDefinition.value === "number"
    ) {
      constraints.max =
        constraints.max === undefined
          ? checkDefinition.value
          : Math.min(constraints.max, checkDefinition.value);
    }
  }

  return constraints.min === undefined && constraints.max === undefined
    ? null
    : constraints;
}

function getNumericCheckDefinition(
  check: unknown
): NumericCheckDefinition | undefined {
  return (check as { _zod?: { def?: NumericCheckDefinition } })._zod?.def;
}

function unwrapSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    return unwrapSchema(schema.unwrap());
  }

  return schema;
}

export { type FormSchemaMetadata, type NumericFieldConstraints };
