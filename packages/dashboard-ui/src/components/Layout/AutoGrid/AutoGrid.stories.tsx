import type { Meta, StoryObj } from "@storybook/react-vite";

import { AutoGrid } from "./AutoGrid";

const meta = {
  title: "Components/Layout/AutoGrid",
  component: AutoGrid
} satisfies Meta<typeof AutoGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoColumnFields: Story = {
  render: () => (
    <div className="w-full max-w-[40rem]">
      <AutoGrid columns={2}>
        <ExampleField label="Title" value="Court grants injunction" />
        <ExampleField label="Event date" value="2026-05-12" />
        <ExampleField
          className="col-span-full"
          label="Details"
          value="What happened, and why does it matter?"
        />
        <ExampleField label="Confidence" value="Medium" />
        <ExampleField label="Status" value="Reported" />
        <ExampleField
          className="col-span-full"
          label="Resolution criteria"
          value="What would resolve or falsify this?"
        />
      </AutoGrid>
    </div>
  )
};

export const WideCards: Story = {
  render: () => (
    <div className="w-full max-w-[46rem]">
      <AutoGrid minColumnWidth="lg">
        <div className="border-border/80 bg-card rounded-xl border p-5 shadow-sm">
          Wider grid item
        </div>
        <div className="border-border/80 bg-card rounded-xl border p-5 shadow-sm">
          Another wider grid item
        </div>
      </AutoGrid>
    </div>
  )
};

function ExampleField({
  className,
  label,
  value
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <p className="text-foreground text-sm font-medium">{label}</p>
      <div className="border-input bg-card text-muted-foreground mt-1 rounded-lg border px-3 py-2 text-sm">
        {value}
      </div>
    </div>
  );
}
