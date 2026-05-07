import { AlertCircle, Link2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

import { useListEntryCitationsQuery } from "@/api";
import {
  Badge,
  Button,
  IconStack,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui";

import { EntryCitationPopover } from "./EntryCitationPopover";
import { HydratedSourceIcon } from "./HydratedSourceIcon";

type EntryCitationIndicatorProps = {
  entryId: string;
  sources: AttachedSourceSummary[];
};
// TODO: Can be better composed
function EntryCitationIndicator({
  entryId,
  sources
}: EntryCitationIndicatorProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data, errorMessage, isError, isLoading, refetch } =
    useListEntryCitationsQuery({ entryId }, { skip: !isPopoverOpen });
  const citations = data?.citations ?? [];
  const triggerLabel = getTriggerLabel({
    citationCount: sources.length,
    isError: false,
    isLoading: false
  });

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger>
        <Button
          aria-label={triggerLabel}
          className="h-7 px-2"
          size="sm"
          variant="ghost"
        >
          <IndicatorContent
            citationCount={sources.length}
            isError={false}
            isLoading={false}
          >
            <IconStack
              items={sources.map((source) => ({
                icon: <HydratedSourceIcon source={source} />
              }))}
            />
          </IndicatorContent>
        </Button>
      </PopoverTrigger>
      {isPopoverOpen ? (
        <PopoverContent align="start" className="w-96 max-w-[calc(100vw-2rem)]">
          <EntryCitationPopover
            citations={citations}
            entryId={entryId}
            isError={isError}
            isLoading={isLoading}
            listErrorMessage={errorMessage}
            onRetry={refetch}
          />
        </PopoverContent>
      ) : null}
    </Popover>
  );
}

function IndicatorContent({
  children,
  citationCount,
  isError,
  isLoading
}: {
  children: ReactNode;
  citationCount: number;
  isError: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1" role="status">
        <span className="bg-muted inline-flex h-2 w-10 animate-pulse rounded-full" />
        <span className="sr-only">Loading citations</span>
      </span>
    );
  }

  if (isError) {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1">
        <AlertCircle aria-hidden="true" className="size-3.5" />
        <span className="text-xs">Sources unavailable</span>
      </span>
    );
  }

  if (citationCount === 0) {
    return (
      <Badge className="text-muted-foreground" variant="outline">
        <Link2 aria-hidden="true" className="mr-1 size-3" />
        Uncited
      </Badge>
    );
  }

  return children;
}

// TODO: Can be removed since this is only for an aria-label
function getTriggerLabel({
  citationCount,
  isError,
  isLoading
}: {
  citationCount: number;
  isError: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return "Citation sources loading";
  }

  if (isError) {
    return "Citation sources unavailable";
  }

  if (citationCount === 0) {
    return "No citation sources attached";
  }

  return `${citationCount} citation source${
    citationCount === 1 ? "" : "s"
  } attached`;
}

export { EntryCitationIndicator, type EntryCitationIndicatorProps };
