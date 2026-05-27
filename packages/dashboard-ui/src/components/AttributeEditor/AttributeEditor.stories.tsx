import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormProvider,
  FormSelect,
  FormTextInput,
  SubmitButton
} from "../Form";
import { AttributeEditor } from "./AttributeEditor";

const meta = {
  title: "Components/AttributeEditor"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const attributeEditorFormSchema = z.object({
  attributes: z.array(
    z.object({
      key: z.string().min(1, "Key is required."),
      type: z.string().min(1, "Type is required."),
      value: z.string().min(1, "Value is required.")
    })
  )
});

type AttributeEditorFormValues = z.input<typeof attributeEditorFormSchema>;

const typeOptions = [
  { label: "Type 1", value: "type-1" },
  { label: "Type 2", value: "type-2" }
];

const defaultValues = {
  attributes: [
    {
      key: "some-key-1",
      type: "type-1",
      value: "some-value-1"
    },
    {
      key: "some-key-2",
      type: "type-2",
      value: ""
    }
  ]
} satisfies AttributeEditorFormValues;

export const Default: Story = {
  render: () => <AttributeEditorStory />
};

export const NarrowContainer: Story = {
  render: () => <AttributeEditorStory containerWidth="24rem" />
};

export const WideContainer: Story = {
  render: () => <AttributeEditorStory containerWidth="72rem" />
};

type AttributeEditorStoryProps = {
  containerWidth?: string;
};

function AttributeEditorStory({ containerWidth }: AttributeEditorStoryProps) {
  return (
    <FormProvider
      defaultValues={defaultValues}
      schema={attributeEditorFormSchema}
    >
      <AttributeEditorForm containerWidth={containerWidth} />
    </FormProvider>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function AttributeEditorForm({ containerWidth }: { containerWidth?: string }) {
  const { append, fields, remove } = useFieldArray<AttributeEditorFormValues>({
    name: "attributes"
  });

  return (
    <div
      className="border-border/80 bg-card rounded-xl border p-5 shadow-sm"
      style={getAttributeEditorContainerStyle(containerWidth)}
    >
      <Form<AttributeEditorFormValues>
        actions={<SubmitButton>Submit</SubmitButton>}
        className="w-full"
        onSubmit={async () => {
          await wait(2000);
        }}
      >
        <AttributeEditor
          getRowKey={(row) => row.id}
          onAddRow={() => append({ key: "", type: "type-1", value: "" })}
          onRemoveRow={(_row, index) => remove(index)}
          rowDefinitions={[
            {
              control: ({ index }) => (
                <FormTextInput<AttributeEditorFormValues>
                  name={`attributes.${index}.key`}
                  placeholder="Some key"
                />
              ),
              label: "Key"
            },
            {
              control: ({ index }) => (
                <FormTextInput<AttributeEditorFormValues>
                  name={`attributes.${index}.value`}
                  placeholder="Some value"
                />
              ),
              label: "Value"
            },
            {
              control: ({ index }) => (
                <FormSelect<AttributeEditorFormValues>
                  name={`attributes.${index}.type`}
                  options={typeOptions}
                  placeholder="Choose type"
                />
              ),
              label: "Type"
            }
          ]}
          rows={fields}
        />
        <AttributeValuePreview />
      </Form>
    </div>
  );
}

function getAttributeEditorContainerStyle(width?: string) {
  return {
    maxWidth: width && "calc(100vw - 2rem)",
    width
  } satisfies CSSProperties;
}

function AttributeValuePreview() {
  const attributes = useWatch<AttributeEditorFormValues, "attributes">({
    name: "attributes"
  });

  return (
    <div className="text-muted-foreground grid gap-1 text-sm">
      <p>Current rows: {attributes.length}</p>
      <p className="break-all">{JSON.stringify(attributes)}</p>
    </div>
  );
}
