import type { AssessmentUpdate } from "@repo/signal-tracker-shared";

import { Badge } from "@/components/ui";

import {
  formatAssessmentConfidence,
  formatAssessmentDate
} from "../formatters";
import { AssessmentPreviewList } from "./AssessmentPreviewList";

type CurrentAssessmentContentProps = {
  assessment: AssessmentUpdate;
};

function CurrentAssessmentContent({
  assessment
}: CurrentAssessmentContentProps) {
  return (
    <article aria-label="Current assessment" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">
          {formatAssessmentConfidence(assessment.confidenceLabel)}
        </Badge>
        {assessment.probabilityPct !== undefined ? (
          <Badge variant="outline">
            {assessment.probabilityPct}% probability
          </Badge>
        ) : null}
        <time
          className="text-muted-foreground"
          dateTime={assessment.entry.sortAt}
        >
          {formatAssessmentDate(assessment.entry.sortAt)}
        </time>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium uppercase">
          Judgment
        </p>
        <p className="text-sm leading-6">{assessment.judgment}</p>
      </div>

      <AssessmentPreviewList
        title="Assumptions"
        items={assessment.assumptions}
      />
      <AssessmentPreviewList title="Indicators" items={assessment.indicators} />
    </article>
  );
}

export { CurrentAssessmentContent, type CurrentAssessmentContentProps };
