import type {
  AttachedSourceSummary,
  EntryCitationRelationType,
  TopicTimelineItem
} from "@repo/signal-tracker-shared";

import { Badge, SourceIcon } from "@/components/ui";

import {
  formatAssessmentConfidence,
  formatAssessmentProbability,
  formatEpistemicStatus,
  formatTimelineDate
} from "../lib/formatters";

type VisibleTimelineItem = Extract<
  TopicTimelineItem,
  { kind: "assessment" | "event" }
>;

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

      <div className="grid gap-1">
        <p className="text-muted-foreground text-xs font-medium uppercase">
          Details
        </p>
        <p className="text-sm leading-6 whitespace-pre-wrap">{entry.bodyMd}</p>
      </div>

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

      <div className="grid gap-1">
        <p className="text-muted-foreground text-xs font-medium uppercase">
          Judgment
        </p>
        <p className="text-sm leading-6 whitespace-pre-wrap">
          {assessment.judgment}
        </p>
      </div>

      <AssessmentDetailList
        items={assessment.assumptions}
        title="Assumptions"
      />
      <AssessmentDetailList items={assessment.indicators} title="Indicators" />

      {assessment.resolutionCriteria ? (
        <div className="grid gap-1">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Resolution criteria
          </p>
          <p className="text-sm leading-6 whitespace-pre-wrap">
            {assessment.resolutionCriteria}
          </p>
        </div>
      ) : null}

      {assessment.targetResolvesAt ? (
        <div className="grid gap-1">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Target resolution date
          </p>
          <time className="text-sm" dateTime={assessment.targetResolvesAt}>
            {formatTimelineDate(assessment.targetResolvesAt)}
          </time>
        </div>
      ) : null}

      <SourceSummaryList sources={entry.sources} />
    </div>
  );
}

function SourceSummaryList({ sources }: { sources: AttachedSourceSummary[] }) {
  return (
    <section aria-label="Sources" className="grid gap-2">
      <p className="text-muted-foreground text-xs font-medium uppercase">
        Sources
      </p>
      {sources.length === 0 ? (
        <p className="text-muted-foreground text-xs">No sources attached.</p>
      ) : (
        <ul className="grid gap-2">
          {sources.map((source) => (
            <li
              className="border-border bg-background/80 grid gap-1 rounded-md border p-3"
              key={source.id}
            >
              <div className="flex min-w-0 items-start gap-2">
                <SourceIcon
                  className="mt-0.5"
                  size="sm"
                  url={
                    source.url ??
                    source.canonicalUrl ??
                    getSourceDomainUrl(source)
                  }
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">
                    {source.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {source.sourceName}
                    {source.sourceDomain ? ` / ${source.sourceDomain}` : ""}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                {formatRelationType(source.relationType)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function getSourceDomainUrl(source: AttachedSourceSummary) {
  return source.sourceDomain ? `https://${source.sourceDomain}` : undefined;
}

function formatRelationType(relationType: EntryCitationRelationType) {
  const relationLabels = {
    contradicts: "Contradicts",
    contextualizes: "Contextualizes",
    source_for: "Source for",
    supports: "Supports"
  } satisfies Record<EntryCitationRelationType, string>;

  return relationLabels[relationType];
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
    <section aria-label={title} className="grid gap-2">
      <p className="text-muted-foreground text-xs font-medium uppercase">
        {title}
      </p>
      <ul className="grid gap-1">
        {items.map((item) => (
          <li className="text-sm leading-6" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export {
  TimelineEntryExpanded,
  type TimelineEntryExpandedProps,
  type VisibleTimelineItem
};
