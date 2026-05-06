import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { FormField } from "./FormField";
import { TextInput } from "../Input";

const meta = {
  title: "UI/FormField"
} satisfies Meta;

export default meta;

type Story = StoryObj;

function InputFieldExample() {
  const [value, setValue] = useState("Compact timeline");

  return (
    <div className="w-96">
      <FormField
        description="Use a short label that can be scanned quickly."
        label="Title"
      >
        {(fieldProps) => (
          <TextInput
            {...fieldProps}
            name="title"
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter title"
            value={value}
          />
        )}
      </FormField>
    </div>
  );
}

function InvalidInputFieldExample() {
  const [value, setValue] = useState("");

  return (
    <div className="w-96">
      <FormField error="Title is required." id="invalid-title" label="Title">
        {(fieldProps) => (
          <TextInput
            {...fieldProps}
            name="title"
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter title"
            value={value}
          />
        )}
      </FormField>
    </div>
  );
}

function CustomLabelStyleExample() {
  const [value, setValue] = useState("");

  return (
    <div className="w-96">
      <FormField
        label={
          <>
            Type <span className="font-medium text-foreground">Archive</span> to
            continue.
          </>
        }
        labelClassName="text-muted-foreground font-normal"
      >
        {(fieldProps) => (
          <TextInput
            {...fieldProps}
            onChange={(event) => setValue(event.target.value)}
            value={value}
          />
        )}
      </FormField>
    </div>
  );
}

export const WithInput: Story = {
  render: () => <InputFieldExample />
};

export const WithInputError: Story = {
  render: () => <InvalidInputFieldExample />
};

export const CustomLabelStyle: Story = {
  render: () => <CustomLabelStyleExample />
};
