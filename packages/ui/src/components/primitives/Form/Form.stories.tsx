import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

import { Alert } from "../Alert/Alert";
import { Button } from "../Button/Button";
import { CheckboxGroup } from "../CheckboxGroup/CheckboxGroup";
import { Dropdown } from "../Dropdown/Dropdown";
import { FormProvider } from "../FormProvider/FormProvider";
import { Input } from "../Input/Input";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { Form } from "./Form";

const formLayoutStyle = {
  display: "grid",
  gap: "var(--space-stack-md)",
  inlineSize: "min(100%, 42rem)"
} as const;

const supportTextStyle = {
  color: "var(--color-text-muted)",
  fontSize: "var(--text-body-sm-size)"
} as const;

const planningMarketOptions = [
  { label: "United States", value: "us" },
  { label: "Canada", value: "ca" },
  { label: "United Kingdom", value: "uk" }
] as const;

const planningAudienceOptions = [
  { label: "Founders", value: "founders" },
  { label: "Operators", value: "operators" },
  { label: "Researchers", value: "researchers" }
] as const;

const planningLeadAudienceOptions = [
  { label: "Founders", value: "founders" },
  { label: "Operators", value: "operators" },
  { label: "Researchers", value: "researchers" }
] as const;

const planningSchema = z.object({
  company: z.string().min(1, "Company name is required."),
  market: z.string().min(1, "Choose a target market."),
  audiences: z
    .array(z.string())
    .min(1, "Select at least one audience segment."),
  leadAudience: z.string().min(1, "Choose a primary audience.")
});

type PlanningFormValues = z.infer<typeof planningSchema>;

const intakeMarketOptions = [
  { label: "North America", value: "na" },
  { label: "Europe", value: "eu" },
  { label: "Asia Pacific", value: "apac" }
] as const;

const intakeAudienceOptions = [
  { label: "Municipal leaders", value: "municipal" },
  { label: "Infrastructure operators", value: "operators" },
  { label: "Policy researchers", value: "researchers" },
  { label: "Media briefings", value: "media" }
] as const;

const intakePrimaryAudienceOptions = [
  { label: "Municipal leaders", value: "municipal" },
  { label: "Infrastructure operators", value: "operators" },
  { label: "Policy researchers", value: "researchers" }
] as const;

const intakeSchema = z.object({
  projectName: z.string().min(1, "Project name is required."),
  sponsor: z.string().min(1, "Sponsoring organization is required."),
  leadAnalyst: z.string().min(1, "Primary analyst is required."),
  market: z.string().min(1, "Choose a deployment region."),
  audiences: z
    .array(z.string())
    .min(2, "Select at least two audience segments."),
  primaryAudience: z.string().min(1, "Choose a primary audience.")
});

type IntakeFormValues = z.infer<typeof intakeSchema>;

function wait(milliseconds = 80) {
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

function SubmitButton({ children }: { children: string }) {
  const { formState } = useFormContext();

  return (
    <Button disabled={formState.isSubmitting} type="submit" variant="primary">
      {formState.isSubmitting ? "Submitting..." : children}
    </Button>
  );
}

function PlanningFormPreview() {
  const values = useWatch<PlanningFormValues>();

  return (
    <div style={supportTextStyle}>
      Current value:{" "}
      {JSON.stringify({
        company: values.company || "<empty>",
        market: values.market || "<empty>",
        audiences:
          values.audiences && values.audiences.length > 0
            ? values.audiences
            : "<empty>",
        leadAudience: values.leadAudience || "<empty>"
      })}
    </div>
  );
}

function PlanningFormStory({
  defaultValues
}: {
  defaultValues?: Partial<PlanningFormValues>;
}) {
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);

  return (
    <FormProvider
      defaultValues={{
        company: "",
        market: "",
        audiences: [],
        leadAudience: "",
        ...defaultValues
      }}
      schema={planningSchema}
    >
      <Form<PlanningFormValues>
        onSubmit={async (values) => {
          await wait();
          setLastSubmission(
            `Saved planning draft for ${values.company} targeting ${values.market}.`
          );
        }}
        style={formLayoutStyle}
      >
        <Input<PlanningFormValues>
          description="This name is used in shared workspace references."
          label="Company name"
          name="company"
          placeholder="OpenAI"
        />
        <Dropdown<PlanningFormValues>
          description="Used to localize regional briefing defaults."
          label="Target market"
          name="market"
          options={planningMarketOptions}
          placeholder="Select a market"
        />
        <CheckboxGroup<PlanningFormValues>
          description="Choose every audience segment that should receive the draft."
          label="Audience segments"
          name="audiences"
          options={planningAudienceOptions}
        />
        <RadioGroup<PlanningFormValues>
          description="Choose the single audience that should lead the narrative."
          label="Primary audience"
          name="leadAudience"
          options={planningLeadAudienceOptions}
        />
        <PlanningFormPreview />
        {lastSubmission ? (
          <Alert tone="success" title="Draft saved">
            {lastSubmission}
          </Alert>
        ) : null}
        <SubmitButton>Save planning form</SubmitButton>
      </Form>
    </FormProvider>
  );
}

function IntakeFormPreview() {
  const values = useWatch<IntakeFormValues>();

  return (
    <div style={supportTextStyle}>
      Intake summary:{" "}
      {JSON.stringify({
        projectName: values.projectName || "<empty>",
        sponsor: values.sponsor || "<empty>",
        leadAnalyst: values.leadAnalyst || "<empty>",
        market: values.market || "<empty>",
        audiences:
          values.audiences && values.audiences.length > 0
            ? values.audiences
            : "<empty>",
        primaryAudience: values.primaryAudience || "<empty>"
      })}
    </div>
  );
}

function IntakeFormStory() {
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);

  return (
    <FormProvider
      defaultValues={{
        projectName: "",
        sponsor: "",
        leadAnalyst: "",
        market: "",
        audiences: [],
        primaryAudience: ""
      }}
      schema={intakeSchema}
    >
      <Form<IntakeFormValues>
        onSubmit={async (values) => {
          await wait();
          setLastSubmission(`Draft saved for ${values.projectName}.`);
        }}
        style={formLayoutStyle}
      >
        <Input<IntakeFormValues>
          description="The internal name used across review queues."
          label="Project name"
          name="projectName"
          placeholder="Port of Los Angeles Brief"
        />
        <Input<IntakeFormValues>
          description="The sponsoring partner or client."
          label="Sponsoring organization"
          name="sponsor"
          placeholder="City of Los Angeles"
        />
        <Input<IntakeFormValues>
          description="The analyst directly responsible for the draft."
          label="Primary analyst"
          name="leadAnalyst"
          placeholder="Annie Case"
        />
        <Dropdown<IntakeFormValues>
          description="Used to pick regional defaults and map layers."
          label="Deployment region"
          name="market"
          options={intakeMarketOptions}
          placeholder="Select a region"
        />
        <CheckboxGroup<IntakeFormValues>
          description="Choose the broader audience set that needs the report."
          label="Audience segments"
          name="audiences"
          options={intakeAudienceOptions}
        />
        <RadioGroup<IntakeFormValues>
          description="Choose the primary audience who should shape the headline."
          label="Primary audience"
          name="primaryAudience"
          options={intakePrimaryAudienceOptions}
        />
        <IntakeFormPreview />
        {lastSubmission ? (
          <Alert tone="success" title="Intake draft saved">
            {lastSubmission}
          </Alert>
        ) : null}
        <SubmitButton>Save intake draft</SubmitButton>
      </Form>
    </FormProvider>
  );
}

const meta = {
  title: "Primitives/Form",
  component: PlanningFormStory,
  argTypes: {
    defaultValues: {
      control: false
    }
  }
} satisfies Meta<typeof PlanningFormStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WorkspacePlanning: Story = {
  render: () => <PlanningFormStory />
};

export const WithExistingSelections: Story = {
  render: () => (
    <PlanningFormStory
      defaultValues={{
        company: "OpenAI",
        market: "ca",
        audiences: ["operators", "researchers"],
        leadAudience: "operators"
      }}
    />
  )
};

export const AnalystProjectIntake: Story = {
  render: () => <IntakeFormStory />,
  play: async ({ canvasElement }) => {
    const submitButton = canvasElement.querySelector('button[type="submit"]');

    if (!(submitButton instanceof HTMLButtonElement)) {
      throw new Error("Expected intake story to render a submit button.");
    }

    submitButton.click();

    await wait();

    const initialText = canvasElement.textContent ?? "";

    if (
      !initialText.includes("Project name is required.") ||
      !initialText.includes("Select at least two audience segments.") ||
      !initialText.includes("Choose a primary audience.")
    ) {
      throw new Error(
        "Expected complex intake story to show multiple validation errors after the first submit."
      );
    }

    const textInputs = canvasElement.querySelectorAll('input[type="text"]');

    if (textInputs.length !== 3) {
      throw new Error(
        `Expected 3 text inputs in the intake story, received ${textInputs.length}.`
      );
    }

    setTextValue(
      textInputs[0] as HTMLInputElement,
      "Port of Los Angeles Brief"
    );
    setTextValue(textInputs[1] as HTMLInputElement, "City of Los Angeles");
    setTextValue(textInputs[2] as HTMLInputElement, "Annie Case");

    const select = canvasElement.querySelector("select");

    if (!(select instanceof HTMLSelectElement)) {
      throw new Error("Expected intake story to render a select element.");
    }

    select.value = "1";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    const checkboxes = canvasElement.querySelectorAll('input[type="checkbox"]');

    if (checkboxes.length < 4) {
      throw new Error(
        `Expected 4 checkbox inputs in the intake story, received ${checkboxes.length}.`
      );
    }

    (checkboxes[0] as HTMLInputElement).click();
    (checkboxes[2] as HTMLInputElement).click();

    const radios = canvasElement.querySelectorAll('input[type="radio"]');

    if (radios.length < 3) {
      throw new Error(
        `Expected 3 radio inputs in the intake story, received ${radios.length}.`
      );
    }

    (radios[1] as HTMLInputElement).click();

    submitButton.click();

    await wait(120);

    const updatedText = canvasElement.textContent ?? "";

    if (!updatedText.includes("Draft saved for Port of Los Angeles Brief.")) {
      throw new Error(
        "Expected the complex intake story to save successfully after valid input."
      );
    }

    if (!updatedText.includes('"market":"eu"')) {
      throw new Error(
        "Expected the intake summary to reflect the selected deployment region."
      );
    }
  }
};
