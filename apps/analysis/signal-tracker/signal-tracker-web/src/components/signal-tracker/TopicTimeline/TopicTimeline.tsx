import { useState } from "react";
import type { TopicTimelineItem } from "@repo/signal-tracker-shared";

import { useListTopicTimelineQuery } from "@/api";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingState
} from "@/components/ui";

import { TimelineEntryRow, type VisibleTimelineItem } from "./components";

type TopicTimelineProps = {
  topicId: string;
};

function TopicTimeline({ topicId }: TopicTimelineProps) {
  const { data, errorMessage, isError, isLoading, refetch } =
    useListTopicTimelineQuery({ topicId });
  const [expandedEntryIds, setExpandedEntryIds] = useState<Set<string>>(
    () => new Set()
  );
  const visibleItems = getVisibleTimelineItems(data?.items ?? []);

  function setEntryExpanded(entryId: string, isExpanded: boolean) {
    setExpandedEntryIds((currentEntryIds) => {
      const nextEntryIds = new Set(currentEntryIds);

      if (isExpanded) {
        nextEntryIds.add(entryId);
      } else {
        nextEntryIds.delete(entryId);
      }

      return nextEntryIds;
    });
  }

  return (
    <section aria-labelledby="topic-timeline-heading">
      <Card>
        <CardHeader>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              History
            </p>
            <h2
              id="topic-timeline-heading"
              className="mt-1 text-xl font-semibold"
            >
              Timeline
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Compact topic history with inline entry details.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingState label="Loading timeline" /> : null}

          {!isLoading && isError ? (
            <Alert
              actions={
                <Button onClick={refetch} variant="outline">
                  Retry
                </Button>
              }
              title="Timeline could not be loaded."
              variant="danger"
            >
              {errorMessage ?? "Retry the request without leaving the page."}
            </Alert>
          ) : null}

          {!isLoading && !isError && visibleItems.length === 0 ? (
            <EmptyState
              className="items-start px-0 text-left"
              description="Add an assessment update or event to start building this topic history."
              title="No timeline entries yet"
            />
          ) : null}

          {!isLoading && !isError && visibleItems.length > 0 ? (
            <ol aria-label="Timeline entries" className="grid gap-3">
              {visibleItems.map((item) => (
                <li key={item.entry.id}>
                  <TimelineEntryRow
                    isExpanded={expandedEntryIds.has(item.entry.id)}
                    item={item}
                    onExpandedChange={(isExpanded) =>
                      setEntryExpanded(item.entry.id, isExpanded)
                    }
                  />
                </li>
              ))}
            </ol>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function getVisibleTimelineItems(
  items: TopicTimelineItem[]
): VisibleTimelineItem[] {
  return items.filter(
    (item): item is VisibleTimelineItem =>
      item.kind === "event" || item.kind === "assessment"
  );
}

export { TopicTimeline, type TopicTimelineProps };
