import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider } from "@repo/ui-base";
import { z } from "zod";

import {
  Form,
  FormDateInput,
  FormSelect,
  FormTextarea,
  FormTextInput
} from "../../Form";
import { AutoGrid } from "./AutoGrid";

const meta = {
  title: "UI/Layout/AutoGrid",
  component: AutoGrid
} satisfies Meta<typeof AutoGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

const exampleFormSchema = z.object({
  confidence: z.string().min(1, "Choose confidence."),
  details: z.string().min(1, "Details are required."),
  eventDate: z.string().min(1, "Event date is required."),
  resolutionCriteria: z.string().optional(),
  status: z.string().min(1, "Choose status."),
  title: z.string().min(1, "Title is required.")
});

type ExampleFormValues = z.input<typeof exampleFormSchema>;

const confidenceOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" }
] as const;

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Reported", value: "reported" },
  { label: "Resolved", value: "resolved" }
] as const;

export const FormFields: Story = {
  render: () => (
    <div className="w-[40rem]">
      <FormProvider
        defaultValues={{
          confidence: "medium",
          details: "",
          eventDate: "",
          resolutionCriteria: "",
          status: "reported",
          title: ""
        }}
        schema={exampleFormSchema}
      >
        <Form<ExampleFormValues> onSubmit={async () => undefined}>
          <AutoGrid columns={2}>
            <FormTextInput<ExampleFormValues>
              label="Title"
              name="title"
              placeholder="Court grants injunction"
            />
            <FormDateInput<ExampleFormValues>
              label="Event date"
              name="eventDate"
            />
            <FormTextarea<ExampleFormValues>
              className="col-span-full"
              label="Details"
              name="details"
              placeholder="What happened, and why does it matter?"
              rows={4}
            />
            <FormSelect<ExampleFormValues>
              label="Confidence"
              name="confidence"
              options={[...confidenceOptions]}
              placeholder="Choose confidence"
            />
            <FormSelect<ExampleFormValues>
              label="Status"
              name="status"
              options={[...statusOptions]}
              placeholder="Choose status"
            />
            <FormTextarea<ExampleFormValues>
              className="col-span-full"
              label="Resolution criteria"
              name="resolutionCriteria"
              placeholder="What would resolve or falsify this?"
              rows={3}
            />
          </AutoGrid>
        </Form>
      </FormProvider>
    </div>
  )
};

export const WideCards: Story = {
  render: () => (
    <div className="w-[46rem]">
      <AutoGrid minColumnWidth="lg">
        <div className="border-border rounded-md border p-4">
          Wider grid item
        </div>
        <div className="border-border rounded-md border p-4">
          Another wider grid item
        </div>
      </AutoGrid>
    </div>
  )
};
