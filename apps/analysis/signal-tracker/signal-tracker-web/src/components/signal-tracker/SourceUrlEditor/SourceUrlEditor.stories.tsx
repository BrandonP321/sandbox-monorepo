import type { Meta, StoryObj } from "@storybook/react-vite";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { FormProvider } from "@repo/ui-base";

import { Form, SubmitButton } from "@/components/ui";

import { SourceUrlEditor } from "./SourceUrlEditor";

const meta = {
  title: "Signal Tracker/SourceUrlEditor"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const sourceUrlEditorStorySchema = z.object({
  sourceUrls: z.array(
    z.object({
      url: z.string().url("Enter a valid source URL.")
    })
  )
});

type SourceUrlEditorStoryValues = z.input<typeof sourceUrlEditorStorySchema>;

const defaultValues = {
  sourceUrls: [
    { url: "https://agency.example/situation-report" },
    { url: "https://www.reuters.com/world/example-briefing" }
  ]
} satisfies SourceUrlEditorStoryValues;

export const Basic: Story = {
  render: () => <SourceUrlEditorStory />
};

function SourceUrlEditorStory() {
  return (
    <FormProvider
      defaultValues={defaultValues}
      schema={sourceUrlEditorStorySchema}
    >
      <div style={{ width: "min(44rem, calc(100vw - 2rem))" }}>
        <Form<SourceUrlEditorStoryValues>
          actions={<SubmitButton>Submit</SubmitButton>}
          onSubmit={async () => undefined}
        >
          <SourceUrlEditor<SourceUrlEditorStoryValues> name="sourceUrls" />
          <SourceUrlEditorState />
        </Form>
      </div>
    </FormProvider>
  );
}

function SourceUrlEditorState() {
  const sourceUrls = useWatch<SourceUrlEditorStoryValues, "sourceUrls">({
    name: "sourceUrls"
  });

  return (
    <div className="text-muted-foreground grid gap-1 text-sm">
      <p>Current rows: {sourceUrls.length}</p>
      <p>{JSON.stringify(sourceUrls)}</p>
    </div>
  );
}
