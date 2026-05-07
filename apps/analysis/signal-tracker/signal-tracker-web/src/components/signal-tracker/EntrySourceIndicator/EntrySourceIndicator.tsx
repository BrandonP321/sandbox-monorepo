import { Link2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

import { Badge, Button, IconStack, SourceIcon } from "@/components/ui";

import { EntrySourceManagerDialog } from "./EntrySourceManagerDialog";

type EntrySourceIndicatorProps = {
  entryId: string;
  sources: AttachedSourceSummary[];
};

function EntrySourceIndicator({ entryId, sources }: EntrySourceIndicatorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sourceUrlSources = getSourceUrlSources(sources);
  const triggerLabel = getTriggerLabel(sourceUrlSources.length);

  return (
    <>
      <Button
        aria-label={triggerLabel}
        className="h-7 px-2"
        onClick={() => setIsDialogOpen(true)}
        size="sm"
        variant="ghost"
      >
        <IndicatorContent sourceCount={sourceUrlSources.length}>
          <IconStack
            items={sourceUrlSources.map((source) => ({
              icon: (
                <SourceIcon
                  size="sm"
                  url={source.url ?? source.canonicalUrl ?? source.sourceDomain}
                />
              )
            }))}
          />
        </IndicatorContent>
      </Button>
      <EntrySourceManagerDialog
        entryId={entryId}
        onOpenChange={setIsDialogOpen}
        open={isDialogOpen}
        sources={sourceUrlSources}
      />
    </>
  );
}

function getSourceUrlSources(sources: AttachedSourceSummary[]) {
  return sources.filter(
    (source) =>
      source.relationType === "source_for" &&
      (source.url !== undefined || source.canonicalUrl !== undefined)
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
