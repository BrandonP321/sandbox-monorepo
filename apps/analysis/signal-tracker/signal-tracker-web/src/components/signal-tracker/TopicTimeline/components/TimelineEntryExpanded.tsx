import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui";

import { AttachedSourceSummaryList } from "../../EntrySourceIndicator/AttachedSourceSummaryList";
import type { VisibleTimelineItem } from "../lib/visible-items";

import {
  formatAssessmentConfidence,
  formatAssessmentProbability,
  formatEpistemicStatus,
  formatTimelineDate
} from "../lib/formatters";

type TimelineEntryExpandedProps = {
  item: VisibleTimelineItem;
};

function TimelineEntryExpanded({ item }: TimelineEntryExpandedProps) {
  if (item.kind === "assessment") {
    return <ExpandedAssessmentEntry item={item} />;
  }

  return <ExpandedEventEntry item={item} />;
}

function ExpandedEventEntry({
  item
}: {
  item: Extract<VisibleTimelineItem, { kind: "event" }>;
}) {
  const { entry } = item;

  return (
    <div className="border-border bg-muted/30 grid gap-4 border-t px-4 py-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline">
          {formatEpistemicStatus(entry.epistemicStatus)}
        </Badge>
        <time className="text-muted-foreground" dateTime={entry.sortAt}>
          {formatTimelineDate(entry.sortAt)}
        </time>
      </div>

      <TimelineDetailSection title="Details">
        <p className="text-sm leading-6 whitespace-pre-wrap">{entry.bodyMd}</p>
      </TimelineDetailSection>

      <SourceSummaryList sources={entry.sources} />
    </div>
  );
}

function ExpandedAssessmentEntry({
  item
}: {
  item: Extract<VisibleTimelineItem, { kind: "assessment" }>;
}) {
  const { assessment, entry } = item;

  return (
    <div className="border-border bg-primary/5 grid gap-4 border-t px-4 py-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">
          {formatAssessmentConfidence(assessment.confidenceLabel)}
        </Badge>
        {assessment.probabilityPct !== undefined ? (
          <Badge variant="outline">
            {formatAssessmentProbability(assessment.probabilityPct)}
          </Badge>
        ) : null}
        <Badge variant="outline">
          {formatEpistemicStatus(entry.epistemicStatus)}
        </Badge>
        <time className="text-muted-foreground" dateTime={entry.sortAt}>
          {formatTimelineDate(entry.sortAt)}
        </time>
      </div>

      <TimelineDetailSection title="Judgment">
        <p className="text-sm leading-6 whitespace-pre-wrap">
          {assessment.judgment}
        </p>
      </TimelineDetailSection>

      <AssessmentDetailList
        items={assessment.assumptions}
        title="Assumptions"
      />
      <AssessmentDetailList items={assessment.indicators} title="Indicators" />

      {assessment.resolutionCriteria ? (
        <TimelineDetailSection title="Resolution criteria">
          <p className="text-sm leading-6 whitespace-pre-wrap">
            {assessment.resolutionCriteria}
          </p>
        </TimelineDetailSection>
      ) : null}

      {assessment.targetResolvesAt ? (
        <TimelineDetailSection title="Target resolution date">
          <time className="text-sm" dateTime={assessment.targetResolvesAt}>
            {formatTimelineDate(assessment.targetResolvesAt)}
          </time>
        </TimelineDetailSection>
      ) : null}

      <SourceSummaryList sources={entry.sources} />
    </div>
  );
}

function SourceSummaryList({ sources }: { sources: AttachedSourceSummary[] }) {
  return (
    <TimelineDetailSection className="grid gap-2" title="Sources">
      <AttachedSourceSummaryList sources={sources} />
    </TimelineDetailSection>
  );
}

function AssessmentDetailList({
  items,
  title
}: {
  items: string[];
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <TimelineDetailSection className="grid gap-2" title={title}>
      <ul className="grid gap-1">
        {items.map((item) => (
          <li className="text-sm leading-6" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </TimelineDetailSection>
  );
}

function TimelineDetailSection({
  children,
  className = "grid gap-1",
  title
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section aria-label={title} className={className}>
      <p className="text-muted-foreground text-xs font-medium uppercase">
        {title}
      </p>
      {children}
    </section>
  );
}

export {
  TimelineEntryExpanded,
  type TimelineEntryExpandedProps,
  type VisibleTimelineItem
};
