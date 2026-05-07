import type {
  AttachedSourceSummary,
  EntryCitationRelationType
} from "@repo/signal-tracker-shared";

import { SourceIcon } from "@/components/ui";

import {
  getAttachedSourceUrl,
  getAttachedSourceUrlDisplay
} from "./source-display";

type AttachedSourceSummaryListProps = {
  sources: AttachedSourceSummary[];
};

function AttachedSourceSummaryList({
  sources
}: AttachedSourceSummaryListProps) {
  if (sources.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">No sources attached.</p>
    );
  }

  return (
    <ul className="grid gap-2">
      {sources.map((source) => (
        <AttachedSourceSummaryListItem key={source.id} source={source} />
      ))}
    </ul>
  );
}

function AttachedSourceSummaryListItem({
  source
}: {
  source: AttachedSourceSummary;
}) {
  const display = getAttachedSourceUrlDisplay(source);
  const sourceDetail = display.sourceDomain ?? display.sourceLabel;
  const sourceIconUrl = getAttachedSourceUrl(source) ?? source.sourceDomain;

  return (
    <li className="border-border bg-background/80 grid gap-2 rounded-md border p-3">
      <div className="flex min-w-0 items-start gap-2">
        <SourceIcon className="mt-0.5" size="sm" url={sourceIconUrl} />
        <div className="min-w-0">
          <p className="text-sm font-medium break-words">
            {display.titleLabel}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {display.sourceLabel}
            {sourceDetail !== display.sourceLabel ? ` / ${sourceDetail}` : ""}
          </p>
        </div>
      </div>

      <dl className="grid gap-1 text-xs">
        {display.canonicalUrl ? (
          <div className="min-w-0">
            <dt className="text-muted-foreground inline">URL: </dt>
            <dd className="inline break-all">{display.canonicalUrl}</dd>
          </div>
        ) : null}
        {display.publishedDateLabel ? (
          <div>
            <dt className="text-muted-foreground inline">Published: </dt>
            <dd className="inline">{display.publishedDateLabel}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-muted-foreground inline">Relation: </dt>
          <dd className="inline">{formatRelationType(source.relationType)}</dd>
        </div>
      </dl>
    </li>
  );
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

export { AttachedSourceSummaryList, type AttachedSourceSummaryListProps };
