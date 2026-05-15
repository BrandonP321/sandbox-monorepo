import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText } from "lucide-react";

import { GlassButton } from "../GlassButton";
import { ContentHeader } from "./ContentHeader";

const meta = {
  title: "Components/ContentHeader",
  component: ContentHeader,
  args: {
    description:
      "Selected work in analytics products, policy tooling, and pragmatic engineering systems.",
    headingLevel: 1,
    title: "Portfolio"
  }
} satisfies Meta<typeof ContentHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PageHeader: Story = {};

export const SectionHeader: Story = {
  args: {
    description: "Focused tools built from the sandbox monorepo.",
    headingLevel: 2,
    title: "Projects"
  }
};

export const HeadingOnly: Story = {
  args: {
    description: undefined,
    headingLevel: 2,
    title: "Experience"
  }
};

export const WithActions: Story = {
  args: {
    actions: (
      <GlassButton icon={<FileText />} variant="primary">
        Resume
      </GlassButton>
    ),
    alignActions: "top",
    description:
      "A brief timeline of engineering roles, with placeholder details until the final copy is ready.",
    headingLevel: 2,
    title: "Experience"
  }
};
