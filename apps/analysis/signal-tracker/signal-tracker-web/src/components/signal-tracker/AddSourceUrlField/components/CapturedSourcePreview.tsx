import { RefreshCw, X } from "lucide-react";

import type {
  AttachedSourceSummary,
  EvidenceRecord
} from "@repo/signal-tracker-shared";

import { Button, SourceIcon } from "@/components/ui";
import { getUrlHostname } from "@/lib/url";

import {
  getAttachedSourceUrlDisplay,
  getSourceUrlDisplay
} from "../lib/source-url";

type CapturedSourcePreviewProps = {
  onRemove: () => void;
  onRetry?: () => void;
  record?: EvidenceRecord;
  source?: AttachedSourceSummary;
  status: "attached" | "captured" | "capturing" | "failed";
  url: string;
  errorMessage?: string;
};

function CapturedSourcePreview({
  errorMessage,
  onRemove,
  onRetry,
  record,
  source,
  status,
  url
}: CapturedSourcePreviewProps) {
  const fallbackSourceLabel = getUrlHostname(url) ?? "Source";
  const display = source
    ? getAttachedSourceUrlDisplay(source)
    : record
      ? getSourceUrlDisplay(record)
      : {
          canonicalUrl: url,
          publishedDateLabel: undefined,
          sourceDomain: fallbackSourceLabel,
          sourceLabel: fallbackSourceLabel,
          titleLabel: url
        };
  const sourceActionLabel = display.sourceLabel || url;
  const sourceIconUrl =
    record?.source.baseUrl ??
    display.canonicalUrl ??
    (display.sourceDomain ? `https://${display.sourceDomain}` : undefined);

  return (
    <article
      aria-label={`Source ${sourceActionLabel}`}
      className="border-border bg-background grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-3 rounded-md border px-3 py-2"
    >
      <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center overflow-hidden rounded-md">
        <SourceIcon url={sourceIconUrl} />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-foreground truncate text-sm font-medium">
            {display.titleLabel}
          </p>
          {status === "capturing" ? (
            <p className="text-muted-foreground text-xs" role="status">
              Capturing source...
            </p>
          ) : null}
          {status === "failed" ? (
            <p className="text-danger text-xs" role="alert">
              {errorMessage ?? "Source URL could not be captured."}
            </p>
          ) : null}
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs">
          <span>{display.sourceLabel}</span>
          {display.publishedDateLabel ? (
            <>
              <span aria-hidden="true">/</span>
              <time>{display.publishedDateLabel}</time>
            </>
          ) : null}
          {display.canonicalUrl ? (
            <>
              <span aria-hidden="true">/</span>
              <span className="truncate">{display.canonicalUrl}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {status === "failed" && onRetry ? (
          <Button
            aria-label={`Retry source ${sourceActionLabel}`}
            iconLeft={<RefreshCw aria-hidden="true" className="size-3.5" />}
            onClick={onRetry}
            size="icon"
            variant="ghost"
          />
        ) : null}
        <Button
          aria-label={`Remove source ${sourceActionLabel}`}
          iconLeft={<X aria-hidden="true" className="size-3.5" />}
          onClick={onRemove}
          size="icon"
          variant="ghost"
        />
      </div>
    </article>
  );
}

export { CapturedSourcePreview, type CapturedSourcePreviewProps };
