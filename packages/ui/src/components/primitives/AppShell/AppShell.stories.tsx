import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell, Download, PanelRightOpen } from "../../../icons";
import { StorybookSearchInput } from "@/storybook/examples/inputs";
import { Button } from "../Button/Button";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup";
import { Container } from "../Container/Container";
import { Masthead } from "../Masthead/Masthead";
import { PageHeader } from "../PageHeader/PageHeader";
import { SidebarNav } from "../SidebarNav/SidebarNav";
import { AppShell } from "./AppShell";

const railContentStyle = {
  display: "grid",
  gap: "var(--space-stack-sm)",
  padding: "var(--layout-panel-padding)"
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
      }
      center={
        <StorybookSearchInput
          aria-label="Search datasets and briefs"
          placeholder="Search datasets and briefs"
          width="min(100%, 20rem)"
        />
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

function ExamplePageActions() {
  return (
    <ButtonGroup aria-label="Briefing actions">
      <Button iconLeft={Download} variant="secondary">
        Export
      </Button>
      <Button variant="primary">Publish</Button>
    </ButtonGroup>
  );
}

function ExampleMain() {
  return (
    <div>
      <PageHeader
        actions={<ExamplePageActions />}
        breadcrumbs={
          <nav aria-label="Breadcrumb">
            <span>Workspace / Briefings / </span>
            <span aria-current="page">Quarterly review</span>
          </nav>
        }
        description="Shared shell structure with a sticky masthead and persistent rails."
        eyebrow="Quarterly briefing"
        title="Port of Los Angeles"
      />
      <Container header="Main content region">
        Shared analysis content inside a bordered workspace panel.
      </Container>
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
    const nav = canvasElement.querySelector(
      'nav[aria-label="Primary navigation"]'
    );
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
      throw new Error(
        "Expected the sidebar toggle to reflect the closed state."
      );
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
