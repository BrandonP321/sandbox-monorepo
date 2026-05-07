import type * as React from "react";
import {
  type FieldArray,
  type FieldArrayPathByValue,
  type FieldValues,
  useFieldArray,
  useWatch
} from "react-hook-form";

import { type FormFieldName } from "@repo/ui-base";

import {
  AttributeEditor,
  Chip,
  FormTextInput,
  SourceIcon
} from "@/components/ui";
import { getUrlHostname } from "@/lib/url";

type SourceUrlEditorNativeProps = Pick<
  React.ComponentProps<"div">,
  "className"
>;

type SourceUrlEditorRow = {
  url: string;
};

type SourceUrlEditorFieldName<TFieldValues extends FieldValues> =
  FieldArrayPathByValue<TFieldValues, SourceUrlEditorRow[]>;

type SourceUrlEditorProps<
  TFieldValues extends FieldValues,
  TName extends SourceUrlEditorFieldName<TFieldValues> =
    SourceUrlEditorFieldName<TFieldValues>
> = SourceUrlEditorNativeProps & {
  addButtonLabel?: string;
  name: TName;
  placeholder?: string;
  urlLabel?: string;
};

function SourceUrlEditor<
  TFieldValues extends FieldValues,
  TName extends SourceUrlEditorFieldName<TFieldValues> =
    SourceUrlEditorFieldName<TFieldValues>
>({
  addButtonLabel = "Add source",
  className,
  name,
  placeholder = "https://example.com/source",
  urlLabel = "Source URL"
}: SourceUrlEditorProps<TFieldValues, TName>) {
  const { append, fields, remove } = useFieldArray<TFieldValues, TName>({
    name
  });

  return (
    <AttributeEditor
      addButtonLabel={addButtonLabel}
      className={className}
      getRowKey={(row) => row.id}
      onAddRow={() =>
        append(createEmptySourceUrlRow() as FieldArray<TFieldValues, TName>)
      }
      onRemoveRow={(_row, index) => remove(index)}
      renderRowDetails={({ index }) => (
        <SourceUrlPreview<TFieldValues>
          name={getSourceUrlFieldName<TFieldValues>(name, index)}
        />
      )}
      rowDefinitions={[
        {
          control: ({ index }) => (
            <FormTextInput<TFieldValues>
              aria-label={`${urlLabel} ${index + 1}`}
              name={getSourceUrlFieldName<TFieldValues>(name, index)}
              placeholder={placeholder}
              type="url"
            />
          ),
          label: urlLabel
        }
      ]}
      rows={fields}
    />
  );
}

function SourceUrlPreview<TFieldValues extends FieldValues>({
  name
}: {
  name: FormFieldName<TFieldValues, string>;
}) {
  const value = useWatch<TFieldValues>({ name });
  const url = typeof value === "string" ? value.trim() : "";

  if (!url) {
    return null;
  }

  const title = getSourceUrlPreviewTitle(url);

  return (
    <div className="min-w-0">
      <Chip
        aria-label={`Source preview for ${title}`}
        iconLeft={<SourceIcon size="sm" url={url} />}
      >
        {title}
      </Chip>
    </div>
  );
}

function getSourceUrlFieldName<TFieldValues extends FieldValues>(
  name: string,
  index: number
) {
  return `${name}.${index}.url` as FormFieldName<TFieldValues, string>;
}

function getSourceUrlPreviewTitle(url: string) {
  return getUrlHostname(url) ?? url;
}

function createEmptySourceUrlRow(): SourceUrlEditorRow {
  return { url: "" };
}

export { SourceUrlEditor, type SourceUrlEditorProps, type SourceUrlEditorRow };
