import { X } from "lucide-react";

import type {
  AttachedSourceSummary,
  EntryCitationRelationType
} from "@repo/signal-tracker-shared";

import { Button, SourceIcon } from "@/components/ui";

import {
  getAttachedSourceUrl,
  getAttachedSourceUrlDisplay
} from "../AddSourceUrlField/lib/source-url";

type AttachedSourceSummaryListProps = {
  onRemoveSource?: (source: AttachedSourceSummary) => void;
  pendingRemoveSourceId?: string | null;
  sources: AttachedSourceSummary[];
};

function AttachedSourceSummaryList({
  onRemoveSource,
  pendingRemoveSourceId,
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
        <AttachedSourceSummaryListItem
          isRemoving={pendingRemoveSourceId === source.id}
          key={source.id}
          onRemoveSource={
            onRemoveSource ? () => onRemoveSource(source) : undefined
          }
          source={source}
        />
      ))}
    </ul>
  );
}

function AttachedSourceSummaryListItem({
  isRemoving,
  onRemoveSource,
  source
}: {
  isRemoving: boolean;
  onRemoveSource?: () => void;
  source: AttachedSourceSummary;
}) {
  const display = getAttachedSourceUrlDisplay(source);
  const sourceDetail = display.sourceDomain ?? display.sourceLabel;
  const sourceIconUrl = getAttachedSourceUrl(source) ?? source.sourceDomain;

  return (
    <li className="border-border bg-background/80 grid gap-2 rounded-md border p-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
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
        {onRemoveSource ? (
          <Button
            aria-label={`Remove source ${display.titleLabel}`}
            disabled={isRemoving}
            iconLeft={<X aria-hidden="true" className="size-3.5" />}
            onClick={onRemoveSource}
            size="sm"
            variant="ghost"
          >
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        ) : null}
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
