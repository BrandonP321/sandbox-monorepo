import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { FormField } from "./FormField";
import { Input } from "./Input";

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
          <Input
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
          <Input
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

export const WithInput: Story = {
  render: () => <InputFieldExample />
};

export const WithInputError: Story = {
  render: () => <InvalidInputFieldExample />
};
