import { useState } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useListTopicsQuery } from "@/api";

type WorkspaceSurface = "topics" | "details";

const surfaces = [
  {
    id: "topics",
    label: "View Topics",
    description: "Find and open active topic dossiers."
  },
  {
    id: "details",
    label: "Topic Details",
    description: "Work from topic context into assessment and timeline detail."
  }
] satisfies Array<{
  id: WorkspaceSurface;
  label: string;
  description: string;
}>;

export function SignalTrackerShell() {
  const [activeSurface, setActiveSurface] =
    useState<WorkspaceSurface>("topics");

  useListTopicsQuery();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="border-border flex flex-col gap-4 border-b py-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              R1 Compact Timeline Workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Signal Tracker</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
              A compact production shell for evidence-backed topic dossiers.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Workspace surfaces">
            {surfaces.map((surface) => (
              <Button
                key={surface.id}
                onClick={() => setActiveSurface(surface.id)}
                variant={activeSurface === surface.id ? "default" : "outline"}
              >
                {surface.label}
              </Button>
            ))}
          </nav>
        </header>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <aside className="border-border bg-card text-card-foreground rounded-lg border p-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Workspace surfaces
            </p>
            <div className="mt-4 grid gap-3">
              {surfaces.map((surface) => (
                <button
                  key={surface.id}
                  className={cn(
                    "border-border bg-background text-left transition-colors",
                    "rounded-md border p-3 hover:bg-accent hover:text-accent-foreground",
                    activeSurface === surface.id &&
                      "border-primary bg-secondary text-secondary-foreground"
                  )}
                  onClick={() => setActiveSurface(surface.id)}
                  type="button"
                >
                  <span className="block text-sm font-medium">
                    {surface.label}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {surface.description}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {activeSurface === "topics" ? <ViewTopicsSurface /> : null}
          {activeSurface === "details" ? <TopicDetailsSurface /> : null}
        </section>
      </section>
    </main>
  );
}

function ViewTopicsSurface() {
  return (
    <section className="border-border bg-card text-card-foreground rounded-lg border p-4">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <p className="text-muted-foreground text-xs font-medium uppercase">
          Primary surface
        </p>
        <h2 className="text-xl font-semibold">View Topics</h2>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Future topic rows will let the analyst scan active dossiers and open
          one workspace at a time.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <PlaceholderPanel
          label="Topic list"
          value="Compact rows for active dossiers"
        />
        <PlaceholderPanel
          label="Selection model"
          value="Open one topic into the detail workspace"
        />
      </div>
    </section>
  );
}

function TopicDetailsSurface() {
  return (
    <section className="border-border bg-card text-card-foreground rounded-lg border p-4">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <p className="text-muted-foreground text-xs font-medium uppercase">
          Primary surface
        </p>
        <h2 className="text-xl font-semibold">Topic Details</h2>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Future topic work will center the timeline while keeping topic context
          and current assessment close at hand.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <PlaceholderPanel
          label="Topic header"
          value="Title and framing question"
        />
        <PlaceholderPanel
          label="Assessment region"
          value="Current view without dominating the page"
        />
        <div className="md:col-span-2">
          <PlaceholderPanel
            label="Timeline workspace"
            value="Compact scan-first entries with detail reserved for later work"
          />
        </div>
      </div>
    </section>
  );
}

function PlaceholderPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-md border p-3">
      <p className="text-muted-foreground text-xs font-medium uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
