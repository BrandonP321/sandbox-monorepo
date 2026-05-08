import type { TopicTimelineItem } from "@repo/signal-tracker-shared";

type VisibleTimelineItem = Extract<
  TopicTimelineItem,
  { kind: "assessment" | "event" }
>;

function getVisibleTimelineItems(
  items: TopicTimelineItem[]
): VisibleTimelineItem[] {
  return items.filter(
    (item): item is VisibleTimelineItem =>
      item.kind === "event" || item.kind === "assessment"
  );
}

export { getVisibleTimelineItems, type VisibleTimelineItem };
