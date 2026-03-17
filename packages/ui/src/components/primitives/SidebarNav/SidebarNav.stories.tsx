import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Bell,
  FileText,
  FolderKanban,
  Gauge,
  ShieldAlert
} from "../../../icons";
import { SidebarNav } from "./SidebarNav";

const footerButtonStyle = {
  inlineSize: "100%",
  minBlockSize: "var(--layout-control-height-dense)",
  padding: "0 var(--space-inset-sm)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-md)",
  background: "var(--color-bg-surface)",
  color: "var(--color-text-secondary)",
  textAlign: "left"
} as const;

const sections = [
  {
    label: "Workspace",
    items: [
      {
        active: true,
        href: "/overview",
        icon: Gauge,
        label: "Overview"
      },
      {
        href: "/briefings",
        icon: FileText,
        label: "Briefings"
      },
      {
        href: "/projects",
        icon: FolderKanban,
        label: "Projects",
        children: [
          {
            href: "/projects/active",
            label: "Active"
          },
          {
            active: true,
            href: "/projects/watchlist",
            label: "Watchlist"
          }
        ]
      }
    ]
  },
  {
    label: "Operations",
    items: [
      {
        href: "/alerts",
        icon: ShieldAlert,
        label: "Alerts"
      },
      {
        disabled: true,
        href: "/notifications",
        icon: Bell,
        label: "Notifications"
      }
    ]
  }
] as const;

const meta = {
  title: "Primitives/SidebarNav",
  component: SidebarNav,
  parameters: {
    layout: "fullscreen"
  },
  args: {
    "aria-label": "Primary navigation",
    footer: (
      <button style={footerButtonStyle} type="button">
        Workspace settings
      </button>
    ),
    mode: "expanded",
    open: true,
    sections
  },
  argTypes: {
    footer: {
      control: false
    },
    sections: {
      control: false
    }
  }
} satisfies Meta<typeof SidebarNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector("nav");

    if (!(nav instanceof HTMLElement)) {
      throw new Error("Expected SidebarNav to render a nav element.");
    }

    const links = nav.querySelectorAll("a");

    if (links.length < 4) {
      throw new Error(
        `Expected SidebarNav to render multiple navigation links, received ${links.length}.`
      );
    }

    const computedStyles = window.getComputedStyle(nav);

    if (computedStyles.backgroundColor !== "rgb(11, 16, 23)") {
      throw new Error(
        `Expected SidebarNav to use the Analyst Core sunken surface, received ${computedStyles.backgroundColor}.`
      );
    }

    if (computedStyles.borderRightColor !== "rgb(34, 48, 66)") {
      throw new Error(
        `Expected SidebarNav to use the Analyst Core default border, received ${computedStyles.borderRightColor}.`
      );
    }
  }
};

export const Collapsed: Story = {
  args: {
    mode: "collapsed"
  }
};

export const Overlay: Story = {
  args: {
    mode: "overlay",
    open: true
  }
};
