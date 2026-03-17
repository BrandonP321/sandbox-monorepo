import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell, PanelRightOpen, Search } from "../../../icons";
import { Icon } from "../Icon/Icon";
import { Masthead } from "../Masthead/Masthead";
import { SidebarNav } from "../SidebarNav/SidebarNav";
import { AppShell } from "./AppShell";

const railContentStyle = {
  display: "grid",
  gap: "var(--space-stack-sm)",
  padding: "var(--layout-panel-padding)"
} as const;

const searchSlotStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-cluster-sm)",
  inlineSize: "min(100%, 20rem)",
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

const mainContentStyle = {
  display: "grid",
  gap: "var(--space-stack-md)",
  padding: "var(--space-6)",
  minBlockSize: "120vh"
} as const;

function waitForUiTick() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

function ExampleMasthead() {
  return (
    <Masthead
      actions={
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
      }
      center={
        <div style={searchSlotStyle}>
          <Icon icon={Search} size="sm" />
          <span>Search datasets and briefs</span>
        </div>
      }
      label="Production"
      sidebarToggle
      title="Analyst Workspace"
    />
  );
}

function ExampleSidebar() {
  return (
    <SidebarNav
      aria-label="Primary navigation"
      id="primary-navigation"
      sections={[
        {
          label: "Workspace",
          items: [
            {
              active: true,
              href: "/overview",
              label: "Overview"
            },
            {
              href: "/signals",
              label: "Signals"
            },
            {
              href: "/risks",
              label: "Risks"
            },
            {
              href: "/exports",
              label: "Exports"
            }
          ]
        }
      ]}
    />
  );
}

function ExampleAside() {
  return (
    <div style={railContentStyle}>
      <strong>Detail pane</strong>
      <span>Selected county: Los Angeles</span>
      <span>Filings lag: 3 days</span>
      <span>Priority: High</span>
    </div>
  );
}

function ExampleMain() {
  return (
    <div style={mainContentStyle}>
      <section>
        <h1 style={{ margin: 0 }}>Quarterly Briefing</h1>
        <p style={{ color: "var(--color-text-secondary)", margin: "0.5rem 0 0" }}>
          Shared shell structure with a sticky masthead and persistent rails.
        </p>
      </section>
      <section
        style={{
          border: "1px solid var(--color-border-default)",
          background: "var(--color-bg-surface)",
          padding: "var(--layout-panel-padding)"
        }}
      >
        Main content region
      </section>
      <section
        style={{
          border: "1px solid var(--color-border-default)",
          background: "var(--color-bg-surface)",
          padding: "var(--layout-panel-padding)"
        }}
      >
        Additional workspace content
      </section>
    </div>
  );
}

const meta = {
  title: "Primitives/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen"
  },
  args: {
    masthead: <ExampleMasthead />,
    sidebarId: "primary-navigation",
    sidebar: <ExampleSidebar />,
    aside: <ExampleAside />,
    children: <ExampleMain />
  },
  argTypes: {
    aside: {
      control: false
    },
    children: {
      control: false
    },
    masthead: {
      control: false
    },
    sidebar: {
      control: false
    }
  }
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector("header");
    const nav = canvasElement.querySelector('nav[aria-label="Primary navigation"]');
    const main = canvasElement.querySelector("main");

    if (!(header instanceof HTMLElement)) {
      throw new Error("Expected AppShell to render a header landmark.");
    }

    if (!(nav instanceof HTMLElement)) {
      throw new Error("Expected AppShell to render a nav landmark.");
    }

    const sidebarToggle = canvasElement.querySelector(
      'button[aria-controls="primary-navigation"]'
    );

    if (!(sidebarToggle instanceof HTMLButtonElement)) {
      throw new Error("Expected AppShell to render a sidebar toggle button.");
    }

    if (!(main instanceof HTMLElement)) {
      throw new Error("Expected AppShell to render a main landmark.");
    }

    const shell = header.parentElement;

    if (!(shell instanceof HTMLDivElement)) {
      throw new Error("Expected AppShell to render a root div.");
    }

    const shellStyles = window.getComputedStyle(shell);
    const headerStyles = window.getComputedStyle(header);
    const mainStyles = window.getComputedStyle(main);
    const navStyles = window.getComputedStyle(nav);

    if (shellStyles.backgroundColor !== "rgb(7, 11, 17)") {
      throw new Error(
        `Expected the shell canvas background to use Analyst Core canvas, received ${shellStyles.backgroundColor}.`
      );
    }

    if (headerStyles.backgroundColor !== "rgb(11, 16, 23)") {
      throw new Error(
        `Expected the masthead surface to use Analyst Core subtle background, received ${headerStyles.backgroundColor}.`
      );
    }

    if (navStyles.backgroundColor !== "rgb(11, 16, 23)") {
      throw new Error(
        `Expected the sidebar rail to use Analyst Core sunken surface, received ${navStyles.backgroundColor}.`
      );
    }

    if (mainStyles.overflowY !== "auto") {
      throw new Error(
        `Expected AppShell main to own vertical scrolling, received overflow-y ${mainStyles.overflowY}.`
      );
    }

    if (sidebarToggle.getAttribute("aria-expanded") !== "true") {
      throw new Error("Expected the sidebar toggle to reflect the open state.");
    }

    sidebarToggle.click();
    await waitForUiTick();

    if (canvasElement.querySelector('nav[aria-label="Primary navigation"]')) {
      throw new Error(
        "Expected clicking the sidebar toggle to close the inline sidebar."
      );
    }

    if (sidebarToggle.getAttribute("aria-expanded") !== "false") {
      throw new Error("Expected the sidebar toggle to reflect the closed state.");
    }

    if (main.getBoundingClientRect().width <= 0) {
      throw new Error(
        "Expected AppShell main content to remain visible when the sidebar is closed."
      );
    }

    sidebarToggle.click();
    await waitForUiTick();

    if (!canvasElement.querySelector('nav[aria-label="Primary navigation"]')) {
      throw new Error(
        "Expected clicking the sidebar toggle again to reopen the sidebar."
      );
    }
  }
};

export const OverlayRails: Story = {
  args: {
    asideMode: "overlay",
    asideOpen: true,
    sidebarMode: "overlay",
    sidebarOpen: true
  }
};
