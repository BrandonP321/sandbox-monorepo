import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { CheckboxGroup, type CheckboxGroupProps } from "./CheckboxGroup";

const options = [
  { label: "Founders", value: "founders" },
  { label: "Operators", value: "operators" },
  { label: "Researchers", value: "researchers" }
] as const;

type CheckboxStoryHarnessProps = CheckboxGroupProps<string> & {
  defaultValue?: string[];
};

function wait(milliseconds = 50) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function CheckboxStoryHarness({
  defaultValue = [],
  ...props
}: CheckboxStoryHarnessProps) {
  const [value, setValue] = useState<string[]>(defaultValue);

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-stack-md)",
        inlineSize: "min(100%, 28rem)"
      }}
    >
      <CheckboxGroup
        {...props}
        value={value}
        onValueChange={(nextValue) => setValue(nextValue)}
      />
      <div
        style={{
          color: "var(--color-text-muted)",
          fontSize: "var(--text-body-sm-size)"
        }}
      >
        Current value: {value.length > 0 ? value.join(", ") : "<empty>"}
      </div>
    </div>
  );
}

const meta = {
  title: "Primitives/CheckboxGroup",
  component: CheckboxStoryHarness,
  args: {
    description: "Select all audience segments that should see this report.",
    label: "Audience",
    options
  }
} satisfies Meta<typeof CheckboxStoryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrefill: Story = {
  render: (args) => (
    <CheckboxStoryHarness
      {...args}
      defaultValue={["founders", "researchers"]}
    />
  )
};

export const Disabled: Story = {
  args: {
    description: "Audience targeting is locked for the current workflow step.",
    disabled: true
  }
};

export const Toggle: Story = {
  play: async ({ canvasElement }) => {
    const checkboxes = canvasElement.querySelectorAll('input[type="checkbox"]');
    const operatorsCheckbox = checkboxes[1];

    if (!(operatorsCheckbox instanceof HTMLInputElement)) {
      throw new Error("Expected CheckboxGroup story to render checkbox inputs.");
    }

    operatorsCheckbox.click();

    await wait();

    const storyText = canvasElement.textContent;

    if (!storyText?.includes("Current value: operators")) {
      throw new Error(
        "Expected the checkbox story preview to update after toggling."
      );
    }
  }
};

export const ValidationError: Story = {
  args: {
    error: "Select at least one audience segment."
  }
};
