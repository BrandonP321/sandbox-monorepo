import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Dropdown, type DropdownProps } from "./Dropdown";

type RegionValue = {
  code: string;
  label: string;
};

const options = [
  { label: "United States", value: "us" },
  { label: "Canada", value: "ca" },
  { label: "United Kingdom", value: "uk" }
] as const;

const regionOptions = [
  {
    label: "North America",
    value: {
      code: "na",
      label: "North America"
    }
  },
  {
    label: "Europe",
    value: {
      code: "eu",
      label: "Europe"
    }
  },
  {
    label: "Asia Pacific",
    value: {
      code: "apac",
      label: "Asia Pacific"
    }
  }
] as const;

type DropdownStoryHarnessProps = DropdownProps<string> & {
  defaultValue?: string;
};

function wait(milliseconds = 50) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function DropdownStoryHarness({
  defaultValue = "",
  ...props
}: DropdownStoryHarnessProps) {
  const [value, setValue] = useState<string | undefined>(
    defaultValue || undefined
  );

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-stack-md)",
        inlineSize: "min(100%, 28rem)"
      }}
    >
      <Dropdown
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
        Current value: {value || "<empty>"}
      </div>
    </div>
  );
}

function ObjectValueDropdownStoryHarness() {
  const [value, setValue] = useState<RegionValue | undefined>(
    regionOptions[1].value
  );

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-stack-md)",
        inlineSize: "min(100%, 28rem)"
      }}
    >
      <Dropdown<RegionValue>
        description="The selected value is a full object, not just a string."
        label="Region"
        options={regionOptions}
        placeholder="Select a region"
        value={value}
        onValueChange={(nextValue) => setValue(nextValue)}
      />
      <div
        style={{
          color: "var(--color-text-muted)",
          fontSize: "var(--text-body-sm-size)"
        }}
      >
        Current value: {value ? JSON.stringify(value) : "<empty>"}
      </div>
    </div>
  );
}

const meta = {
  title: "Primitives/Dropdown",
  component: DropdownStoryHarness,
  args: {
    description: "Used when the choice set is small and fixed.",
    label: "Country",
    options,
    placeholder: "Select a country",
    required: true
  }
} satisfies Meta<typeof DropdownStoryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrefill: Story = {
  render: (args) => <DropdownStoryHarness {...args} defaultValue="ca" />
};

export const Disabled: Story = {
  args: {
    description: "This field is locked for the current workflow step.",
    disabled: true
  }
};

export const SelectionChange: Story = {
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector("select");

    if (!(select instanceof HTMLSelectElement)) {
      throw new Error("Expected Dropdown story to render a select element.");
    }

    select.value = "1";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    await wait();

    const storyText = canvasElement.textContent;

    if (!storyText?.includes("Current value: ca")) {
      throw new Error(
        "Expected the dropdown story preview to update after selection."
      );
    }
  }
};

export const ValidationError: Story = {
  args: {
    error: "Country is required."
  }
};

export const ObjectValue: Story = {
  render: () => <ObjectValueDropdownStoryHarness />,
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector("select");

    if (!(select instanceof HTMLSelectElement)) {
      throw new Error("Expected ObjectValue story to render a select element.");
    }

    const initialLabel = select.selectedOptions[0]?.textContent ?? "";

    if (initialLabel !== "Europe") {
      throw new Error("Expected the initial object value to select Europe.");
    }

    select.value = "2";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    await wait();

    const updatedLabel = select.selectedOptions[0]?.textContent ?? "";

    if (updatedLabel !== "Asia Pacific") {
      throw new Error(
        "Expected the dropdown to update its displayed label after selecting a new object value."
      );
    }

    const storyText = canvasElement.textContent;

    if (!storyText?.includes('"code":"apac"')) {
      throw new Error("Expected the object value preview to update after selection.");
    }
  }
};
