import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "../Button/Button";
import { Input, type InputProps } from "./Input";

const exampleSchema = z.object({
  company: z.string().min(1, "Company name is required.")
});

type ExampleFormValues = z.infer<typeof exampleSchema>;

type InputStoryHarnessProps = InputProps<ExampleFormValues> & {
  defaultValue?: string;
};

function InputStoryHarness({
  defaultValue = "",
  ...props
}: InputStoryHarnessProps) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      company: defaultValue
    },
    resolver: zodResolver(exampleSchema)
  });

  const value = form.watch("company");

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
        <Input {...props} />
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
  title: "Primitives/Input",
  component: InputStoryHarness,
  args: {
    description: "Used internally for portfolio project data entry.",
    label: "Company name",
    name: "company",
    placeholder: "OpenAI",
    required: true,
    type: "text"
  }
} satisfies Meta<typeof InputStoryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrefill: Story = {
  render: (args) => <InputStoryHarness {...args} defaultValue="OpenAI" />
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
      throw new Error("Expected Input story to render a submit button.");
    }

    submitButton.click();

    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });

    const error = canvasElement.textContent;

    if (!error?.includes("Company name is required.")) {
      throw new Error("Expected validation error to render after submit.");
    }
  }
};
