import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui";
import { cn } from "@repo/dashboard-ui";

import {
  formatAssessmentConfidence,
  formatAssessmentProbability,
  formatEpistemicStatus,
  formatTimelineDate,
  formatTimelineItemKind
} from "../lib/formatters";
import {
  TimelineEntryExpanded,
  type VisibleTimelineItem
} from "./TimelineEntryExpanded";

type TimelineEntryRowProps = {
  actionClusterSlot?: ReactNode;
  isExpanded: boolean;
  item: VisibleTimelineItem;
  onExpandedChange: (isExpanded: boolean) => void;
  sourceIndicatorSlot?: ReactNode;
};

function TimelineEntryRow({
  actionClusterSlot,
  isExpanded,
  item,
  onExpandedChange,
  sourceIndicatorSlot
}: TimelineEntryRowProps) {
  const { entry } = item;
  const kindLabel = formatTimelineItemKind(item.kind);

  return (
    <article
      className={cn(
        "bg-card border-border overflow-hidden rounded-md border border-l-4 shadow-xs",
        item.kind === "assessment"
          ? "border-l-primary"
          : "border-l-muted-foreground/30"
      )}
    >
      <Collapsible open={isExpanded} onOpenChange={onExpandedChange}>
        <div className="grid gap-3 px-4 py-3 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-center">
          <div className="flex flex-wrap items-center gap-2 sm:block">
            <time
              className="text-muted-foreground text-xs font-medium"
              dateTime={entry.sortAt}
            >
              {formatTimelineDate(entry.sortAt)}
            </time>
            <Badge
              className="mt-0 sm:mt-2"
              variant={item.kind === "assessment" ? "secondary" : "outline"}
            >
              {kindLabel}
            </Badge>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold">{entry.title}</h3>
            {item.kind === "assessment" ? (
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {item.assessment.judgment}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {formatEpistemicStatus(entry.epistemicStatus)}
              </Badge>
              {item.kind === "assessment" ? (
                <>
                  <Badge variant="secondary">
                    {formatAssessmentConfidence(
                      item.assessment.confidenceLabel
                    )}
                  </Badge>
                  {item.assessment.probabilityPct !== undefined ? (
                    <Badge variant="outline">
                      {formatAssessmentProbability(
                        item.assessment.probabilityPct
                      )}
                    </Badge>
                  ) : null}
                </>
              ) : null}
              {sourceIndicatorSlot ?? (
                <span aria-hidden="true" className="inline-flex h-5 w-10" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
            {actionClusterSlot}
            <CollapsibleTrigger>
              <Button
                iconLeft={
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-4 transition-transform",
                      isExpanded ? "rotate-180" : undefined
                    )}
                  />
                }
                size="sm"
                variant="ghost"
              >
                <span>{isExpanded ? "Collapse" : "Expand"}</span>
                <span className="sr-only"> details for {entry.title}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <TimelineEntryExpanded item={item} />
        </CollapsibleContent>
      </Collapsible>
    </article>
  );
}

export { TimelineEntryRow, type TimelineEntryRowProps };
