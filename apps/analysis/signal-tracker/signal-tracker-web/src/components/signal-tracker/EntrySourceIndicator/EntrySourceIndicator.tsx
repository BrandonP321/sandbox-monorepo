import { Link2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

import {
  Badge,
  Button,
  IconStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SourceIcon
} from "@/components/ui";

import { EntrySourcePopover } from "./EntrySourcePopover";

type EntrySourceIndicatorProps = {
  entryId: string;
  sources: AttachedSourceSummary[];
};

function EntrySourceIndicator({ entryId, sources }: EntrySourceIndicatorProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const triggerLabel = getTriggerLabel(sources.length);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger>
        <Button
          aria-label={triggerLabel}
          className="h-7 px-2"
          size="sm"
          variant="ghost"
        >
          <IndicatorContent sourceCount={sources.length}>
            <IconStack
              items={sources.map((source) => ({
                icon: (
                  <SourceIcon
                    size="sm"
                    url={
                      source.url ?? source.canonicalUrl ?? source.sourceDomain
                    }
                  />
                )
              }))}
            />
          </IndicatorContent>
        </Button>
      </PopoverTrigger>
      {isPopoverOpen ? (
        <PopoverContent align="start" className="w-96 max-w-[calc(100vw-2rem)]">
          <EntrySourcePopover entryId={entryId} sources={sources} />
        </PopoverContent>
      ) : null}
    </Popover>
  );
}

function IndicatorContent({
  children,
  sourceCount
}: {
  children: ReactNode;
  sourceCount: number;
}) {
  if (sourceCount === 0) {
    return (
      <Badge className="text-muted-foreground" variant="outline">
        <Link2 aria-hidden="true" className="mr-1 size-3" />
        Uncited
      </Badge>
    );
  }

  return children;
}

function getTriggerLabel(sourceCount: number) {
  if (sourceCount === 0) {
    return "No sources attached";
  }

  return `${sourceCount} source${sourceCount === 1 ? "" : "s"} attached`;
}

export { EntrySourceIndicator, type EntrySourceIndicatorProps };
