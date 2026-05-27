import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { ContentHeader } from "./ContentHeader";

const meta = {
  title: "Components/ContentHeader",
  component: ContentHeader
} satisfies Meta<typeof ContentHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PageHeader: Story = {
  args: {
    description: "Scan active dossiers and open one topic workspace at a time.",
    eyebrow: "Signal Tracker",
    headingLevel: 1,
    title: "Topics"
  },
  render: () => (
    <div className="border-border w-full max-w-[42rem] border-b pb-5">
      <ContentHeader
        actions={<Button>Create topic</Button>}
        description="Scan active dossiers and open one topic workspace at a time."
        eyebrow="Signal Tracker"
        headingLevel={1}
        title="Topics"
      />
    </div>
  )
};

export const SectionHeader: Story = {
  args: {
    description: "Compact topic history with inline entry details.",
    eyebrow: "History",
    headingLevel: 2,
    title: "Timeline"
  },
  render: () => (
    <div className="w-full max-w-[36rem]">
      <ContentHeader
        actions={
          <Button size="sm" variant="outline">
            Retry
          </Button>
        }
        description="Compact topic history with inline entry details."
        eyebrow="History"
        headingLevel={2}
        title="Timeline"
      />
    </div>
  )
};

export const CompactSectionHeader: Story = {
  args: {
    description: "Archive hides this topic without deleting its history.",
    headingLevel: 2,
    headingSize: "h5",
    title: "Lifecycle"
  },
  render: () => (
    <div className="w-full max-w-[28rem]">
      <ContentHeader
        description="Archive hides this topic without deleting its history."
        headingLevel={2}
        headingSize="h5"
        title="Lifecycle"
      />
    </div>
  )
};
