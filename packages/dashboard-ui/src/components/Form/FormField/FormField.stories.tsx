import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { FormField } from "./FormField";
import { TextInput } from "../Input";

const meta = {
  title: "Components/Form/FormField"
} satisfies Meta;

export default meta;

type Story = StoryObj;

function InputFieldExample() {
  const [value, setValue] = useState("Compact timeline");

  return (
    <div className="w-full max-w-md">
      <FormField
        description="Use a short label that can be scanned quickly."
        label="Title"
        required
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
    <div className="w-full max-w-md">
      <FormField
        description="Errors stay close to the control and preserve the helper text."
        error="Title is required."
        id="invalid-title"
        label="Title"
        required
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

function CustomLabelStyleExample() {
  const [value, setValue] = useState("");

  return (
    <div className="w-full max-w-md">
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
