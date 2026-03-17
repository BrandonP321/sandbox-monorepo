import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell, Menu, PanelRightOpen, Search } from "../../../icons";
import { Icon } from "../Icon/Icon";
import styles from "./Masthead.module.scss";
import { Masthead } from "./Masthead";

const searchSlotStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-cluster-sm)",
  inlineSize: "min(100%, 22rem)",
  minInlineSize: 0,
  padding: "0 var(--space-inset-sm)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-md)",
  background: "var(--color-bg-surface-sunken)",
  color: "var(--color-text-muted)",
  minBlockSize: "var(--layout-control-height-dense)"
} as const;

const actionButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "var(--layout-control-height-dense)",
  blockSize: "var(--layout-control-height-dense)",
  padding: 0,
  border: "1px solid transparent",
  borderRadius: "var(--radius-md)",
  background: "transparent",
  color: "var(--color-icon-muted)"
} as const;

function SearchSlot() {
  return (
    <div style={searchSlotStyle}>
      <Icon icon={Search} size="sm" />
      <span>Search datasets, briefs, and alerts</span>
    </div>
  );
}

function NavToggle() {
  return (
    <button
      aria-controls="sidebar-nav"
      aria-expanded="true"
      aria-label="Collapse navigation"
      style={actionButtonStyle}
      type="button"
    >
      <Icon icon={Menu} size="sm" />
    </button>
  );
}

function GlobalActions() {
  return (
    <>
      <button
        aria-label="Open detail pane"
        style={actionButtonStyle}
        type="button"
      >
        <Icon icon={PanelRightOpen} size="sm" />
      </button>
      <button
        aria-label="Open notifications"
        style={actionButtonStyle}
        type="button"
      >
        <Icon icon={Bell} size="sm" />
      </button>
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(`.${styles.root}`);

    if (!(root instanceof HTMLDivElement)) {
      throw new Error("Expected Masthead to render a root div.");
    }

    const buttons = root.querySelectorAll("button");

    if (buttons.length !== 3) {
      throw new Error(
        `Expected 3 masthead action buttons, received ${buttons.length}.`
      );
    }

    const computedStyles = window.getComputedStyle(root);

    if (computedStyles.backgroundColor !== "rgb(11, 16, 23)") {
      throw new Error(
        `Expected Masthead to use the Analyst Core subtle surface, received ${computedStyles.backgroundColor}.`
      );
    }

    if (computedStyles.borderBottomColor !== "rgb(34, 48, 66)") {
      throw new Error(
        `Expected Masthead to use the Analyst Core default border, received ${computedStyles.borderBottomColor}.`
      );
    }

    if (computedStyles.minHeight !== "56px") {
      throw new Error(
        `Expected Masthead to use the shared header height token, received ${computedStyles.minHeight}.`
      );
    }
  }
};

export const WithoutCenter: Story = {
  args: {
    center: undefined
  }
};
