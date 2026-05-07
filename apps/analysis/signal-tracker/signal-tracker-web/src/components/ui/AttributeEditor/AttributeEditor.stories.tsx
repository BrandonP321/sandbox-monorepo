import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider } from "@repo/ui-base";
import { useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";

import { Form, SubmitButton } from "../Form";
import { FormSelect } from "../Form/FormSelect";
import { FormTextInput } from "../Form/FormTextInput";
import { AttributeEditor } from "./AttributeEditor";

const meta = {
  title: "UI/AttributeEditor"
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

export const Basic: Story = {
  render: () => <AttributeEditorStory />
};

function AttributeEditorStory() {
  return (
    <FormProvider
      defaultValues={defaultValues}
      schema={attributeEditorFormSchema}
    >
      <AttributeEditorForm />
    </FormProvider>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function AttributeEditorForm() {
  const { append, fields, remove } = useFieldArray<AttributeEditorFormValues>({
    name: "attributes"
  });

  return (
    <div style={{ width: "min(72rem, calc(100vw - 2rem))" }}>
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

function AttributeValuePreview() {
  const attributes = useWatch<AttributeEditorFormValues, "attributes">({
    name: "attributes"
  });

  return (
    <div className="text-muted-foreground grid gap-1 text-sm">
      <p>Current rows: {attributes.length}</p>
      <p>{JSON.stringify(attributes)}</p>
    </div>
  );
}
