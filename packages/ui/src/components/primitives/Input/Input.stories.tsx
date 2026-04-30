import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Search } from "../../../icons";
import { Input, type InputProps } from "./Input";

type InputStoryHarnessProps = InputProps & {
  defaultValue?: string;
};

function wait(milliseconds = 50) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function setTextValue(input: HTMLInputElement, value: string) {
  const prototype = Object.getPrototypeOf(input) as HTMLInputElement;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  valueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function InputStoryHarness({
  defaultValue = "",
  ...props
}: InputStoryHarnessProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-stack-md)",
        inlineSize: "min(100%, 28rem)"
      }}
    >
      <Input
        {...props}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <div
        style={{
          color: "var(--color-text-muted)",
          fontSize: "var(--text-body-sm-size)"
        }}
      >
        Current value: {value || "<empty>"}
      </div>
    </div>
  );
}

const meta = {
  title: "Primitives/Input",
  component: InputStoryHarness,
  args: {
    description: "Used internally for portfolio project data entry.",
    label: "Company name",
    placeholder: "OpenAI",
    required: true,
    type: "text"
  },
  argTypes: {
    iconLeft: {
      control: false
    }
  }
} satisfies Meta<typeof InputStoryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrefill: Story = {
  render: (args) => <InputStoryHarness {...args} defaultValue="OpenAI" />
};

export const WithLeadingIcon: Story = {
  args: {
    iconLeft: Search,
    placeholder: "Search datasets and briefs"
  }
};

export const Disabled: Story = {
  args: {
    description: "This field is locked for the current workflow step.",
    disabled: true
  }
};

export const Typing: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector("input");

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Expected Input story to render an input element.");
    }

    setTextValue(input, "OpenAI");

    await wait();

    const storyText = canvasElement.textContent;

    if (!storyText?.includes("Current value: OpenAI")) {
      throw new Error(
        "Expected the input story preview to update after typing."
      );
    }
  }
};

export const ValidationError: Story = {
  args: {
    error: "Company name is required."
  }
};
