import type { ChangeEvent } from "react";
import { useState } from "react";

import { useDebouncedValue } from "@repo/ui-base";

import { useListTopicsQuery } from "@/api";
import { Button, Input, Skeleton } from "@/components/ui";

import { TopicListItem } from "./TopicListItem";

const searchDebounceMs = 250;

export function ListTopicsPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), searchDebounceMs);
  const normalizedQuery = debouncedQuery || undefined;
  const { data, isError, isLoading, refetch } = useListTopicsQuery({
    query: normalizedQuery
  });
  const topics = data?.topics ?? [];
  const hasQuery = normalizedQuery !== undefined;

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-border border-b pb-5">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Signal Tracker
          </p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Topics</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                Scan active dossiers and open one topic workspace at a time.
              </p>
            </div>

            <Button disabled variant="outline">
              Create topic
            </Button>
          </div>
        </header>

        <section className="py-5" aria-labelledby="list-topics-heading">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="list-topics-heading" className="text-xl font-semibold">
                Active topics
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Titles, framing questions, and compact scope notes only.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <label className="text-sm font-medium" htmlFor="topic-search">
                Search topics
              </label>
              <Input
                className="mt-2"
                id="topic-search"
                name="topic-search"
                onChange={handleSearchChange}
                placeholder="Filter by title or framing question"
                value={query}
              />
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? <TopicListLoadingState /> : null}
            {!isLoading && isError ? (
              <TopicListErrorState onRetry={refetch} />
            ) : null}
            {!isLoading && !isError && topics.length === 0 ? (
              <TopicListEmptyState hasQuery={hasQuery} />
            ) : null}
            {!isLoading && !isError && topics.length > 0 ? (
              <ul
                className="m-0 grid list-none gap-3 p-0"
                aria-label="Active topics"
              >
                {topics.map((topic) => (
                  <TopicListItem key={topic.id} topic={topic} />
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function TopicListLoadingState() {
  return (
    <div aria-live="polite" className="grid gap-3" role="status">
      <span className="sr-only">Loading active topics</span>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function TopicListErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-destructive/40 bg-destructive/5 rounded-md border p-4">
      <p className="text-sm font-medium">Topics could not be loaded.</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Retry the request without leaving the page.
      </p>
      <Button className="mt-3" onClick={onRetry} variant="outline">
        Retry
      </Button>
    </div>
  );
}

function TopicListEmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="border-border bg-background rounded-md border p-4">
      <p className="text-sm font-medium">
        {hasQuery ? "No matching topics found." : "No active topics yet."}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {hasQuery
          ? "Adjust the search text to return to the active dossier list."
          : "Create topic will start the next topic dossier."}
      </p>
    </div>
  );
}
