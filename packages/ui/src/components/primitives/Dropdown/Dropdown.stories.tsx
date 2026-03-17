import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "../Button/Button";
import { Dropdown, type DropdownProps } from "./Dropdown";

const exampleSchema = z.object({
  country: z.string().min(1, "Country is required.")
});

type ExampleFormValues = z.infer<typeof exampleSchema>;
type RegionValue = {
  code: string;
  label: string;
};
type ExampleObjectFormValues = {
  region?: RegionValue | null;
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

type DropdownStoryHarnessProps = DropdownProps<ExampleFormValues> & {
  defaultValue?: string;
};

function DropdownStoryHarness({
  defaultValue = "",
  ...props
}: DropdownStoryHarnessProps) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      country: defaultValue
    },
    resolver: zodResolver(exampleSchema)
  });

  const value = form.watch("country");

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(() => undefined)(event);
        }}
        style={{
          display: "grid",
          gap: "var(--space-stack-md)",
          inlineSize: "min(100%, 28rem)"
        }}
      >
        <Dropdown {...props} />
        <div
          style={{
            color: "var(--color-surface-muted-foreground)",
            fontSize: "var(--text-body-sm-size)"
          }}
        >
          Current value: {value || "<empty>"}
        </div>
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </form>
    </FormProvider>
  );
}

function ObjectValueDropdownStoryHarness() {
  const form = useForm<ExampleObjectFormValues>({
    defaultValues: {
      region: regionOptions[1].value
    }
  });

  const value = form.watch("region");

  return (
    <FormProvider {...form}>
      <form
        style={{
          display: "grid",
          gap: "var(--space-stack-md)",
          inlineSize: "min(100%, 28rem)"
        }}
      >
        <Dropdown<ExampleObjectFormValues, RegionValue>
          description="The selected value is a full object, not just a string."
          label="Region"
          name="region"
          options={regionOptions}
          placeholder="Select a region"
        />
        <div
          style={{
            color: "var(--color-surface-muted-foreground)",
            fontSize: "var(--text-body-sm-size)"
          }}
        >
          Current value: {value ? JSON.stringify(value) : "<empty>"}
        </div>
      </form>
    </FormProvider>
  );
}

const meta = {
  title: "Primitives/Dropdown",
  component: DropdownStoryHarness,
  args: {
    description: "Used when the choice set is small and fixed.",
    label: "Country",
    name: "country",
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

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const submitButton = canvasElement.querySelector('button[type="submit"]');

    if (!(submitButton instanceof HTMLButtonElement)) {
      throw new Error("Expected Dropdown story to render a submit button.");
    }

    submitButton.click();

    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });

    const error = canvasElement.textContent;

    if (!error?.includes("Country is required.")) {
      throw new Error("Expected validation error to render after submit.");
    }
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

    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });

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
