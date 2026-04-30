import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { RadioGroup, type RadioGroupProps } from "./RadioGroup";

const options = [
  { label: "Founders", value: "founders" },
  { label: "Operators", value: "operators" },
  { label: "Researchers", value: "researchers" }
] as const;

type RadioGroupStoryHarnessProps = RadioGroupProps<string> & {
  defaultValue?: string;
};

function wait(milliseconds = 50) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function RadioGroupStoryHarness({
  defaultValue = "",
  ...props
}: RadioGroupStoryHarnessProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-stack-md)",
        inlineSize: "min(100%, 28rem)"
      }}
    >
      <RadioGroup
        {...props}
        value={value || undefined}
        onValueChange={(nextValue) => setValue(nextValue)}
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
  title: "Primitives/RadioGroup",
  component: RadioGroupStoryHarness,
  args: {
    description:
      "Choose the single audience segment that should lead this report.",
    label: "Audience",
    options
  }
} satisfies Meta<typeof RadioGroupStoryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrefill: Story = {
  render: (args) => (
    <RadioGroupStoryHarness {...args} defaultValue="operators" />
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
    const radios = canvasElement.querySelectorAll('input[type="radio"]');
    const researchersRadio = radios[2];

    if (!(researchersRadio instanceof HTMLInputElement)) {
      throw new Error("Expected RadioGroup story to render radio inputs.");
    }

    researchersRadio.click();

    await wait();

    const storyText = canvasElement.textContent;

    if (!storyText?.includes("Current value: researchers")) {
      throw new Error(
        "Expected the radio group story preview to update after toggling."
      );
    }
  }
};

export const ValidationError: Story = {
  args: {
    error: "Select a primary audience segment."
  }
};
