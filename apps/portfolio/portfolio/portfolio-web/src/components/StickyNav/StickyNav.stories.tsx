import type { Meta, StoryObj } from "@storybook/react-vite";

import { StickyNav } from "./StickyNav";
import type { StickyNavItem } from "./StickyNav";

const navItems = [
  { href: "#intro", label: "Intro" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#writing", label: "Writing" },
  { href: "/resume.pdf", label: "Resume", openInNewTab: true }
] satisfies [StickyNavItem, ...StickyNavItem[]];

const meta = {
  title: "Components/StickyNav",
  component: StickyNav,
  args: {
    items: navItems
  },
  argTypes: {
    items: {
      control: false
    }
  },
  decorators: [
    (Story) => (
      <div className="portfolio-sticky-nav-story">
        <Story />
      </div>
    )
  ],
  parameters: {
    portfolioPreview: "fullscreen"
  }
} satisfies Meta<typeof StickyNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
