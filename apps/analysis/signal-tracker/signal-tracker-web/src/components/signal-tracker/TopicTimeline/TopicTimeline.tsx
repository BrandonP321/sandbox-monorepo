import { useState } from "react";
import type {
  EntryReadModel,
  TopicTimelineItem
} from "@repo/signal-tracker-shared";

import { useListTopicTimelineQuery } from "@/api";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  ContentHeader,
  EmptyState,
  LoadingState
} from "@/components/ui";

import { EntryCitationIndicator } from "../EntryCitationIndicator";
import { TimelineEntryRow, type VisibleTimelineItem } from "./components";

type TopicTimelineProps = {
  onEditEventEntry?: (entry: EntryReadModel) => void;
  topicId: string;
};

function TopicTimeline({ onEditEventEntry, topicId }: TopicTimelineProps) {
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
    <section>
      <Card>
        <CardHeader>
          <ContentHeader
            description="Compact topic history with inline entry details."
            eyebrow="History"
            headingLevel={2}
            title="Timeline"
          />
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
                    actionClusterSlot={
                      item.kind === "event" && onEditEventEntry ? (
                        <Button
                          onClick={() => onEditEventEntry(item.entry)}
                          size="sm"
                          variant="ghost"
                        >
                          Edit
                        </Button>
                      ) : undefined
                    }
                    isExpanded={expandedEntryIds.has(item.entry.id)}
                    item={item}
                    onExpandedChange={(isExpanded) =>
                      setEntryExpanded(item.entry.id, isExpanded)
                    }
                    sourceIndicatorSlot={
                      <EntryCitationIndicator
                        entryId={item.entry.id}
                        sources={item.entry.sources}
                      />
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
