import { Link } from "@tanstack/react-router";

import { appRoutes } from "@/routeRegistry";

import { useTopicDetailsPageParams } from "./hooks/useTopicDetailsPageParams";

export function TopicDetailsPendingPage() {
  const { topicId } = useTopicDetailsPageParams();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-border border-b pb-5">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Signal Tracker
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Topic Details</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Topic ID: {topicId}
          </p>
        </header>

        <section className="py-5">
          <div className="border-border bg-background rounded-md border p-4">
            <p className="text-sm font-medium">
              Topic detail content is not implemented yet.
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              This route is ready for the Topic Details page.
            </p>
            <Link
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-colors outline-none focus-visible:ring-[3px]"
              to={appRoutes.listTopics.path}
            >
              Back to topics
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
