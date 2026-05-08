import { Button } from "@/components/ui";

import { EntrySourceIndicator } from "../../EntrySourceIndicator";
import { EventEntryDialog } from "../../EventEntryDialog";
import type { VisibleTimelineItem } from "../lib/visible-items";
import { TimelineEntryRow } from "./TimelineEntryRow";

type TopicTimelineEntryListProps = {
  expandedEntryIds: Set<string>;
  items: VisibleTimelineItem[];
  onEntryExpandedChange: (entryId: string, isExpanded: boolean) => void;
  topicId: string;
};

function TopicTimelineEntryList({
  expandedEntryIds,
  items,
  onEntryExpandedChange,
  topicId
}: TopicTimelineEntryListProps) {
  return (
    <ol aria-label="Timeline entries" className="grid gap-3">
      {items.map((item) => (
        <li key={item.entry.id}>
          <TimelineEntryRow
            actionClusterSlot={
              item.kind === "event" ? (
                <EventEntryDialog entry={item.entry} topicId={topicId}>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </EventEntryDialog>
              ) : undefined
            }
            isExpanded={expandedEntryIds.has(item.entry.id)}
            item={item}
            onExpandedChange={(isExpanded) =>
              onEntryExpandedChange(item.entry.id, isExpanded)
            }
            sourceIndicatorSlot={
              <EntrySourceIndicator
                entryId={item.entry.id}
                sources={item.entry.sources}
              />
            }
          />
        </li>
      ))}
    </ol>
  );
}

export { TopicTimelineEntryList, type TopicTimelineEntryListProps };
