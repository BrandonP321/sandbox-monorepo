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

import { TopicTimelineEntryList } from "./components";
import { useExpandedEntryIds } from "./hooks/useExpandedEntryIds";
import { getVisibleTimelineItems } from "./lib/visible-items";
import { EventEntryDialog } from "../EventEntryDialog";

type TopicTimelineProps = {
  topicId: string;
};

function TopicTimeline({ topicId }: TopicTimelineProps) {
  const { data, errorMessage, isError, isLoading, refetch } =
    useListTopicTimelineQuery({ topicId });
  const { expandedEntryIds, setEntryExpanded } = useExpandedEntryIds();
  const visibleItems = getVisibleTimelineItems(data?.items ?? []);

  return (
    <section>
      <Card>
        <CardHeader>
          <ContentHeader
            description="Compact topic history with inline entry details."
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
              action={
                <EventEntryDialog topicId={topicId}>
                  <Button variant="outline">Add event</Button>
                </EventEntryDialog>
              }
              description="Add the first event to start building this topic history."
              title="No timeline entries yet"
            />
          ) : null}

          {!isLoading && !isError && visibleItems.length > 0 ? (
            <TopicTimelineEntryList
              expandedEntryIds={expandedEntryIds}
              items={visibleItems}
              onEntryExpandedChange={setEntryExpanded}
              topicId={topicId}
            />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

export { TopicTimeline, type TopicTimelineProps };
