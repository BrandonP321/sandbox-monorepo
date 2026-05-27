import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, LayoutDashboard, Settings } from "lucide-react";

import { Button } from "../Button";
import { Flashbar, type FlashbarProps } from "./Flashbar";

const meta = {
  title: "Components/Flashbar",
  component: Flashbar,
  decorators: [
    (Story, context) =>
      context.parameters.layout === "fullscreen" ? (
        <Story />
      ) : (
        <div className="w-full max-w-xl">
          <Story />
        </div>
      )
  ]
} satisfies Meta<typeof Flashbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InfoDefault: Story = {
  args: {
    notifications: [
      {
        content: "Evidence can be attached after the topic has enough context.",
        header: "Evidence can wait.",
        id: "evidence-can-wait",
        type: "info"
      }
    ]
  }
};

export const AllTypes: Story = {
  args: {
    notifications: [
      {
        content: "The topic is available in the active topic list.",
        id: "success",
        type: "success"
      },
      {
        content: "Save or discard edits before leaving this view.",
        id: "warning",
        type: "warning"
      },
      {
        content: "Resolve the API error before trying again.",
        header: "Topic could not be deleted.",
        id: "error",
        type: "error"
      },
      {
        content: "Evidence can be attached after the topic has enough context.",
        id: "info",
        type: "info"
      }
    ]
  }
};

export const StackedWithActions: Story = {
  args: {
    notifications: [
      {
        action: <Button variant="outline">Review topic</Button>,
        content: "The topic is available in the active topic list.",
        header: "Topic created.",
        id: "created",
        type: "success"
      },
      {
        action: <Button variant="outline">Retry</Button>,
        content: "Retry the request without leaving the page.",
        dismissLabel: "Dismiss load failure",
        header: "Topics could not be loaded.",
        id: "load-failed",
        type: "error"
      },
      {
        content: "Save or discard edits before leaving this view.",
        dismissLabel: "Dismiss unsaved changes warning",
        header: "Unsaved changes.",
        id: "unsaved",
        type: "warning"
      }
    ]
  }
};

export const InsideDashboardShell: Story = {
  args: {
    notifications: [
      {
        action: <Button variant="outline">Review topic</Button>,
        content: "The topic is available in the active topic list.",
        header: "Topic created.",
        id: "created",
        type: "success"
      },
      {
        action: <Button variant="outline">Retry</Button>,
        content: "Retry the request without leaving the page.",
        dismissLabel: "Dismiss load failure",
        header: "Topics could not be loaded.",
        id: "load-failed",
        type: "error"
      }
    ]
  },
  parameters: {
    layout: "fullscreen"
  },
  render: (args) => <FlashbarDashboardShellStory {...args} />
};

const dashboardRoutes = [
  {
    icon: <LayoutDashboard className="size-4" />,
    id: "overview",
    title: "Overview"
  },
  {
    icon: <Bell className="size-4" />,
    id: "notifications",
    title: "Notifications"
  },
  {
    icon: <Settings className="size-4" />,
    id: "settings",
    title: "Settings"
  }
];

function FlashbarDashboardShellStory(args: Story["args"]) {
  const flashbarProps = {
    ...args,
    notifications: args.notifications ?? []
  } satisfies FlashbarProps;

  return (
    <div className="bg-background text-foreground flex min-h-screen w-screen">
      <aside className="border-border/70 bg-card hidden w-64 shrink-0 border-r p-4 md:block">
        <FlashbarShellBrand />
        <nav aria-label="Example navigation" className="mt-6 grid gap-1">
          {dashboardRoutes.map((route) => (
            <a
              aria-current={route.id === "notifications" ? "page" : undefined}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              href="#"
              key={route.id}
            >
              {route.icon}
              <span>{route.title}</span>
            </a>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="border-border/70 bg-background/95 sticky top-0 z-20 border-b px-6 py-4">
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
        <div className="mx-auto grid w-full max-w-5xl gap-6 p-6">
          <Flashbar {...flashbarProps} />
          <div className="grid gap-3 md:grid-cols-3">
            {["Overview", "Recent activity", "Follow-up queue"].map((title) => (
              <section
                className="bg-card text-card-foreground border-border/80 rounded-lg border p-5 shadow-sm"
                key={title}
              >
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Flashbar alerts sit above page content while the dashboard
                  shell keeps navigation and headers in place.
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function FlashbarShellBrand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
      >
        F
      </span>
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-semibold">
          Flashbar
        </p>
        <p className="text-muted-foreground truncate text-xs">Shell example</p>
      </div>
    </div>
  );
}
