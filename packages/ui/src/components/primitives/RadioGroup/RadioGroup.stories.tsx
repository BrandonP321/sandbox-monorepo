import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "../Button/Button";
import { RadioGroup, type RadioGroupProps } from "./RadioGroup";

const options = [
  { label: "Founders", value: "founders" },
  { label: "Operators", value: "operators" },
  { label: "Researchers", value: "researchers" }
] as const;

const exampleSchema = z.object({
  audience: z.string().min(1, "Select a primary audience segment.")
});

type ExampleFormValues = z.infer<typeof exampleSchema>;

type RadioGroupStoryHarnessProps = RadioGroupProps<ExampleFormValues, string> & {
  defaultValue?: string;
};

function RadioGroupStoryHarness({
  defaultValue = "",
  ...props
}: RadioGroupStoryHarnessProps) {
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
        <RadioGroup {...props} />
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

const meta = {
  title: "Primitives/RadioGroup",
  component: RadioGroupStoryHarness,
  args: {
    description: "Choose the single audience segment that should lead this report.",
    label: "Audience",
    name: "audience",
    options
  }
} satisfies Meta<typeof RadioGroupStoryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrefill: Story = {
  render: (args) => <RadioGroupStoryHarness {...args} defaultValue="operators" />
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

    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });

    const storyText = canvasElement.textContent;

    if (!storyText?.includes("Current value: researchers")) {
      throw new Error(
        "Expected the radio group story preview to update after toggling."
      );
    }
  }
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const submitButton = canvasElement.querySelector('button[type="submit"]');

    if (!(submitButton instanceof HTMLButtonElement)) {
      throw new Error("Expected RadioGroup story to render a submit button.");
    }

    submitButton.click();

    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });

    const error = canvasElement.textContent;

    if (!error?.includes("Select a primary audience segment.")) {
      throw new Error("Expected validation error to render after submit.");
    }
  }
};
