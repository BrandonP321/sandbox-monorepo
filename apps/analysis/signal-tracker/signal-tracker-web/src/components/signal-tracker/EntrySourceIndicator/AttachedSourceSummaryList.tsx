import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

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
    <ul className="flex flex-wrap gap-2">
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
  const sourceUrl = getAttachedSourceUrl(source);
  const sourceIconUrl = sourceUrl ?? source.sourceDomain;
  const content = (
    <>
      <SourceIcon size="sm" url={sourceIconUrl} />
      <span className="min-w-0 truncate">{display.titleLabel}</span>
    </>
  );
  const className =
    "border-border bg-background hover:bg-muted/60 inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";

  return (
    <li className="min-w-0">
      {sourceUrl ? (
        <a
          className={className}
          href={sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        <span className={className}>{content}</span>
      )}
    </li>
  );
}

export { AttachedSourceSummaryList, type AttachedSourceSummaryListProps };
