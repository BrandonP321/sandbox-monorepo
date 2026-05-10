import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider } from "@repo/ui-base";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../Button";
import { Form } from "./Form";
import { FormDateInput } from "../FormDateInput";
import { FormNumberInput } from "../FormNumberInput";
import { FormSelect } from "../FormSelect";
import { FormTextInput } from "../FormTextInput";
import { FormTextarea } from "../FormTextarea";

const meta = {
  title: "UI/Form/Form"
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

const dateFormSchema = z.object({
  assessmentDate: z.string().min(1, "Assessment date is required."),
  targetResolutionDate: z.string().optional()
});

type DateFormValues = z.input<typeof dateFormSchema>;

const numberFormSchema = z.object({
  probabilityPct: z.number().min(0).max(100).optional()
});

type NumberFormValues = z.input<typeof numberFormSchema>;

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
    <div className="border-border/80 bg-muted/40 text-muted-foreground grid gap-1 rounded-lg border p-3 text-sm">
      <p>Current title: {title || "<empty>"}</p>
      <p>Current subtitle: {subtitle || "<empty>"}</p>
      <p>Current priority: {priority || "<empty>"}</p>
      <p>Current summary: {summary || "<empty>"}</p>
    </div>
  );
}

function FormNumberValuePreview() {
  const probabilityPct = useWatch<NumberFormValues, "probabilityPct">({
    name: "probabilityPct"
  });

  return (
    <div className="border-border/80 bg-muted/40 text-muted-foreground grid gap-1 rounded-lg border p-3 text-sm">
      <p>Current probability: {probabilityPct ?? "<empty>"}</p>
    </div>
  );
}

function FormDateValuePreview() {
  const assessmentDate = useWatch<DateFormValues, "assessmentDate">({
    name: "assessmentDate"
  });
  const targetResolutionDate = useWatch<DateFormValues, "targetResolutionDate">(
    {
      name: "targetResolutionDate"
    }
  );

  return (
    <div className="border-border/80 bg-muted/40 text-muted-foreground grid gap-1 rounded-lg border p-3 text-sm">
      <p>Current assessment date: {assessmentDate || "<empty>"}</p>
      <p>Current target date: {targetResolutionDate || "<empty>"}</p>
    </div>
  );
}

function FormTextInputExample() {
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
        className="grid w-full max-w-md gap-4"
        onSubmit={async (values) => {
          setSubmittedValues(values);
        }}
      >
        <FormTextInput<ExampleFormValues>
          description="This story shows FormTextInput wiring FormField and TextInput to React Hook Form."
          label="Title"
          name="title"
          placeholder="Enter title"
        />
        <FormTextInput<ExampleFormValues>
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
          description="Required textarea fields use the same schema-derived indicator as FormTextInput."
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

function FormDateInputExample() {
  const [submittedValues, setSubmittedValues] = useState<DateFormValues | null>(
    null
  );

  return (
    <FormProvider
      defaultValues={{
        assessmentDate: "2026-05-05",
        targetResolutionDate: ""
      }}
      schema={dateFormSchema}
    >
      <Form<DateFormValues>
        className="grid w-full max-w-md gap-4"
        onSubmit={async (values) => {
          setSubmittedValues(values);
        }}
      >
        <FormDateInput<DateFormValues>
          description="Date-backed fields use the date input wrapper."
          label="Assessment date"
          max="2026-12-31"
          min="2026-01-01"
          name="assessmentDate"
        />
        <FormDateInput<DateFormValues>
          description="Optional date fields do not show the required indicator."
          label="Target resolution date"
          name="targetResolutionDate"
        />
        <div className="flex items-center gap-2">
          <Button type="submit">Submit</Button>
        </div>
        <FormDateValuePreview />
        {submittedValues ? (
          <p className="text-sm">
            Submitted values: {JSON.stringify(submittedValues)}
          </p>
        ) : null}
      </Form>
    </FormProvider>
  );
}

function FormNumberInputExample() {
  const [submittedValues, setSubmittedValues] =
    useState<NumberFormValues | null>(null);

  return (
    <FormProvider
      defaultValues={{
        probabilityPct: 35
      }}
      schema={numberFormSchema}
    >
      <Form<NumberFormValues>
        className="grid w-full max-w-md gap-4"
        onSubmit={async (values) => {
          setSubmittedValues(values);
        }}
      >
        <FormNumberInput<NumberFormValues>
          description="Optional forecast probability."
          label="Probability"
          name="probabilityPct"
          step={1}
        />
        <div className="flex items-center gap-2">
          <Button type="submit">Submit</Button>
        </div>
        <FormNumberValuePreview />
        {submittedValues ? (
          <p className="text-sm">
            Submitted values: {JSON.stringify(submittedValues)}
          </p>
        ) : null}
      </Form>
    </FormProvider>
  );
}

export const FormTextInputControl: Story = {
  render: () => <FormTextInputExample />
};

export const FormDateInputControl: Story = {
  render: () => <FormDateInputExample />
};

export const FormNumberInputControl: Story = {
  render: () => <FormNumberInputExample />
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
        className="w-full max-w-md"
        error="Topic could not be saved. Resolve the API error and try again."
        errorTitle="Unable to save topic"
        onSubmit={async () => undefined}
      >
        <FormTextInput<ExampleFormValues>
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
