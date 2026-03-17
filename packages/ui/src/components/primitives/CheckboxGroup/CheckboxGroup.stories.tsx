import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "../Button/Button";
import { CheckboxGroup, type CheckboxGroupProps } from "./CheckboxGroup";

const options = [
  { label: "Founders", value: "founders" },
  { label: "Operators", value: "operators" },
  { label: "Researchers", value: "researchers" }
] as const;

const exampleSchema = z.object({
  audience: z.array(z.string()).min(1, "Select at least one audience segment.")
});

type ExampleFormValues = z.infer<typeof exampleSchema>;

type CheckboxStoryHarnessProps = CheckboxGroupProps<
  ExampleFormValues,
  string
> & {
  defaultValue?: string[];
};

function CheckboxStoryHarness({
  defaultValue = [],
  ...props
}: CheckboxStoryHarnessProps) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      audience: defaultValue
    },
    resolver: zodResolver(exampleSchema)
  });

  const value = form.watch("audience");

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
        <CheckboxGroup {...props} />
        <div
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--text-body-sm-size)"
          }}
        >
          Current value: {value.length > 0 ? value.join(", ") : "<empty>"}
        </div>
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </form>
    </FormProvider>
  );
}

const meta = {
  title: "Primitives/CheckboxGroup",
  component: CheckboxStoryHarness,
  args: {
    description: "Select all audience segments that should see this report.",
    label: "Audience",
    name: "audience",
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

    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });

    const storyText = canvasElement.textContent;

    if (!storyText?.includes("Current value: operators")) {
      throw new Error(
        "Expected the checkbox story preview to update after toggling."
      );
    }
  }
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const submitButton = canvasElement.querySelector('button[type="submit"]');

    if (!(submitButton instanceof HTMLButtonElement)) {
      throw new Error("Expected CheckboxGroup story to render a submit button.");
    }

    submitButton.click();

    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });

    const error = canvasElement.textContent;

    if (!error?.includes("Select at least one audience segment.")) {
      throw new Error("Expected validation error to render after submit.");
    }
  }
};
