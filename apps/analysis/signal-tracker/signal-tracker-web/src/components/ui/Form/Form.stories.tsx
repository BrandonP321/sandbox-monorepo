import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider } from "@repo/ui-base";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "../Button";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormTextarea } from "./FormTextarea";

const meta = {
  title: "UI/Form"
} satisfies Meta;

export default meta;

type Story = StoryObj;

const exampleFormSchema = z.object({
  priority: z.string().min(1, "Choose a priority."),
  summary: z.string().min(1, "Summary is required."),
  subtitle: z.string().optional(),
  title: z.string().min(1, "Title is required.")
});

type ExampleFormValues = z.input<typeof exampleFormSchema>;

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" }
] as const;

function FormValuePreview() {
  const priority = useWatch<ExampleFormValues, "priority">({
    name: "priority"
  });
  const summary = useWatch<ExampleFormValues, "summary">({
    name: "summary"
  });
  const subtitle = useWatch<ExampleFormValues, "subtitle">({
    name: "subtitle"
  });
  const title = useWatch<ExampleFormValues, "title">({ name: "title" });

  return (
    <div className="text-muted-foreground grid gap-1 text-sm">
      <p>Current title: {title || "<empty>"}</p>
      <p>Current subtitle: {subtitle || "<empty>"}</p>
      <p>Current priority: {priority || "<empty>"}</p>
      <p>Current summary: {summary || "<empty>"}</p>
    </div>
  );
}

function FormInputExample() {
  const [submittedValues, setSubmittedValues] =
    useState<ExampleFormValues | null>(null);

  return (
    <FormProvider
      defaultValues={{
        priority: "medium",
        subtitle: "",
        summary: "A short description of the timeline direction.",
        title: "Compact timeline"
      }}
      schema={exampleFormSchema}
    >
      <Form<ExampleFormValues>
        className="grid w-96 gap-4"
        onSubmit={async (values) => {
          setSubmittedValues(values);
        }}
      >
        <FormInput<ExampleFormValues>
          description="This story shows FormInput wiring FormField and Input to React Hook Form."
          label="Title"
          name="title"
          placeholder="Enter title"
        />
        <FormInput<ExampleFormValues>
          description="Optional fields do not show the required indicator."
          label="Subtitle"
          name="subtitle"
          placeholder="Enter subtitle"
        />
        <FormSelect<ExampleFormValues>
          description="Required select fields use the existing ui-base dropdown control behavior."
          label="Priority"
          name="priority"
          options={[...priorityOptions]}
          placeholder="Choose priority"
        />
        <FormTextarea<ExampleFormValues>
          description="Required textarea fields use the same schema-derived indicator as FormInput."
          label="Summary"
          name="summary"
          placeholder="Enter summary"
        />
        <div className="flex items-center gap-2">
          <Button type="submit">Submit</Button>
        </div>
        <FormValuePreview />
        {submittedValues ? (
          <p className="text-sm">
            Submitted values: {JSON.stringify(submittedValues)}
          </p>
        ) : null}
      </Form>
    </FormProvider>
  );
}

export const FormInputControl: Story = {
  render: () => <FormInputExample />
};

export const WithErrorMessage: Story = {
  render: () => (
    <FormProvider
      defaultValues={{
        priority: "high",
        subtitle: "",
        summary: "A short description of the timeline direction.",
        title: "Compact timeline"
      }}
      schema={exampleFormSchema}
    >
      <Form<ExampleFormValues>
        actions={<Button type="submit">Save changes</Button>}
        className="w-96"
        error="Topic could not be saved. Resolve the API error and try again."
        errorTitle="Unable to save topic"
        onSubmit={async () => undefined}
      >
        <FormInput<ExampleFormValues>
          label="Title"
          name="title"
          placeholder="Enter title"
        />
        <FormTextarea<ExampleFormValues>
          label="Summary"
          name="summary"
          placeholder="Enter summary"
        />
      </Form>
    </FormProvider>
  )
};
