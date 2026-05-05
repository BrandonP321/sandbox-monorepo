import type { ChangeEvent } from "react";
import { useState } from "react";

import { Radar } from "lucide-react";
import { useDebouncedValue } from "@repo/ui-base";

import { useListTopicsQuery } from "@/api";
import {
  Alert,
  Button,
  EmptyState,
  Input,
  LoadingState
} from "@/components/ui";

import { CreateTopicDialog } from "./components/CreateTopicDialog";
import { TopicListItem } from "./components/TopicListItem";

const searchDebounceMs = 500;

// TODO: Create reusable UI components for this page.

export function ListTopicsPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), searchDebounceMs);
  const normalizedQuery = debouncedQuery || undefined;
  const { data, errorMessage, isError, isLoading, refetch } =
    useListTopicsQuery({
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

            <CreateTopicDialog />
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
            {isLoading ? <LoadingState label="Loading active topics" /> : null}

            {!isLoading && isError ? (
              <Alert
                actions={
                  <Button onClick={refetch} variant="outline">
                    Retry
                  </Button>
                }
                title="Topics could not be loaded."
                variant="danger"
              >
                {errorMessage ?? "Retry the request without leaving the page."}
              </Alert>
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

function TopicListEmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <EmptyState
      action={hasQuery ? undefined : <CreateTopicDialog />}
      description={
        hasQuery
          ? "Adjust the search text to return to the active dossier list."
          : "Create topic will start the next topic dossier."
      }
      icon={<Radar className="size-8" strokeWidth={1.75} />}
      title={hasQuery ? "No matching topics found." : "No active topics yet."}
    />
  );
}
