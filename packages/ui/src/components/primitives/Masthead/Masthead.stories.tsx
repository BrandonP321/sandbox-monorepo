import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell, Menu, PanelRightOpen } from "../../../icons";
import { StorybookSearchInput } from "@/storybook/examples/inputs";
import { Button } from "../Button/Button";
import { Masthead } from "./Masthead";

function SearchSlot() {
  return (
    <StorybookSearchInput
      aria-label="Search datasets, briefs, and alerts"
      placeholder="Search datasets, briefs, and alerts"
      width="min(100%, 22rem)"
    />
  );
}

function NavToggle() {
  return (
    <Button
      aria-controls="sidebar-nav"
      aria-expanded="true"
      aria-label="Collapse navigation"
      iconLeft={Menu}
      size="sm"
      variant="secondary"
    />
  );
}

function GlobalActions() {
  return (
    <>
      <Button
        aria-label="Open detail pane"
        iconLeft={PanelRightOpen}
        size="sm"
        variant="secondary"
      />
      <Button
        aria-label="Open notifications"
        iconLeft={Bell}
        size="sm"
        variant="secondary"
      />
    </>
  );
}

const meta = {
  title: "Primitives/Masthead",
  component: Masthead,
  parameters: {
    layout: "fullscreen"
  },
  args: {
    actions: <GlobalActions />,
    center: <SearchSlot />,
    label: "Production",
    start: <NavToggle />,
    title: "Analyst Workspace"
  },
  argTypes: {
    actions: {
      control: false
    },
    center: {
      control: false
    },
    label: {
      control: "text"
    },
    start: {
      control: false
    },
    title: {
      control: "text"
    }
  }
} satisfies Meta<typeof Masthead>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCenter: Story = {
  args: {
    center: undefined
  }
};
