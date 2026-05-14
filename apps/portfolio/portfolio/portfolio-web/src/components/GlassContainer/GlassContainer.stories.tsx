import type { Meta, StoryObj } from "@storybook/react-vite";

import { ContentHeader } from "../ContentHeader";
import { GlassContainer } from "./GlassContainer";

const meta = {
  title: "Components/GlassContainer",
  component: GlassContainer,
  args: {
    children: (
      <>
        <ContentHeader
          description="Temporary content for reviewing the portfolio glass surface."
          headingLevel={2}
          title="Below the fold"
        />
        <p>
          Placeholder copy for future project and experience detail inside the
          extracted glass container.
        </p>
      </>
    )
  },
  decorators: [
    (Story) => (
      <div className="portfolio-story-preview">
        <div style={{ width: "min(100%, 68rem)" }}>
          <Story />
        </div>
      </div>
    )
  ]
} satisfies Meta<typeof GlassContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
