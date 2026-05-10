import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card, CardContent, CardHeader } from "../../Card";
import { ContentHeader } from "../../ContentHeader";
import { Stack } from "../Stack";
import { WithAside } from "./WithAside";

const meta = {
  title: "UI/Layout/WithAside",
  component: WithAside
} satisfies Meta<typeof WithAside>;

export default meta;

type Story = StoryObj;

export const TopicDetails: Story = {
  render: () => (
    <div className="w-full max-w-[54rem]">
      <WithAside
        aside={
          <Card>
            <CardHeader>
              <ContentHeader
                description="Latest active assessment update."
                eyebrow="Assessment"
                headingLevel={2}
                headingSize="h3"
                title="Current assessment"
              />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Assessment content stays in the right rail on large screens.
              </p>
            </CardContent>
          </Card>
        }
        stickyAside
      >
        <Stack gap="sm">
          <Card>
            <CardContent className="pt-4">
              Timeline entry with compact scan-level details.
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              Another timeline row in the main column.
            </CardContent>
          </Card>
        </Stack>
      </WithAside>
    </div>
  )
};

export const NarrowAside: Story = {
  render: () => (
    <div className="w-full max-w-[48rem]">
      <WithAside
        aside={
          <div className="border-border/80 bg-card rounded-xl border p-5 text-sm shadow-sm">
            Narrow aside
          </div>
        }
        asideWidth="sm"
      >
        <div className="border-border/80 bg-card rounded-xl border p-5 text-sm shadow-sm">
          Main content
        </div>
      </WithAside>
    </div>
  )
};
