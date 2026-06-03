import type {
  AssessmentConfidenceLabel,
  EntryEpistemicStatus,
  TopicTimelineItem
} from "@repo/signal-tracker-shared";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC"
});

function formatTimelineDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

function formatTimelineItemKind(kind: TopicTimelineItem["kind"]): string {
  if (kind === "assessment") {
    return "Assessment";
  }

  if (kind === "review") {
    return "Review Note";
  }

  return "Event";
}

function formatEpistemicStatus(status: EntryEpistemicStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatAssessmentConfidence(
  confidenceLabel: AssessmentConfidenceLabel
): string {
  return confidenceLabel.charAt(0).toUpperCase() + confidenceLabel.slice(1);
}

function formatAssessmentProbability(probabilityPct: number): string {
  return `${probabilityPct}% probability`;
}

export {
  formatAssessmentConfidence,
  formatAssessmentProbability,
  formatEpistemicStatus,
  formatTimelineDate,
  formatTimelineItemKind
};
