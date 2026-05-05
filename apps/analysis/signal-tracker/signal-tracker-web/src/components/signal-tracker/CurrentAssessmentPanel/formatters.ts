import type { AssessmentConfidenceLabel } from "@repo/signal-tracker-shared";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC"
});

function formatAssessmentConfidence(
  confidenceLabel: AssessmentConfidenceLabel
): string {
  return confidenceLabel.charAt(0).toUpperCase() + confidenceLabel.slice(1);
}

function formatAssessmentDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

export { formatAssessmentConfidence, formatAssessmentDate };
