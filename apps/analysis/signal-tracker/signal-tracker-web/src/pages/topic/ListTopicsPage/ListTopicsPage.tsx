import type { ChangeEvent } from "react";
import { useState } from "react";

import { Radar } from "lucide-react";
import { useDebouncedValue } from "@repo/ui-base";

import { useListTopicsQuery } from "@/api";
import {
  Alert,
  Button,
  ContentHeader,
  EmptyState,
  Input,
  LoadingState
} from "@/components/ui";

import { CreateTopicDialog } from "./components/CreateTopicDialog";
import { TopicListItem } from "./components/TopicListItem";

const searchDebounceMs = 500;

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
    <main className="bg-background text-foreground h-screen overflow-hidden supports-[height:100svh]:h-svh">
      <section className="mx-auto h-screen w-full max-w-5xl overflow-y-auto overscroll-y-contain px-4 py-6 supports-[height:100svh]:h-svh sm:px-6 lg:px-8">
        <header className="border-border border-b pb-5">
          <ContentHeader
            actions={<CreateTopicDialog />}
            description="Scan active dossiers and open one topic workspace at a time."
            eyebrow="Signal Tracker"
            headingLevel={1}
            title="Topics"
          />
        </header>

        <section className="py-5">
          <ContentHeader
            actions={
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
            }
            description="Titles, framing questions, and compact scope notes only."
            headingLevel={2}
            title="Active topics"
          />

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
