import type { AssessmentUpdate } from "@repo/signal-tracker-shared";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState
} from "@/components/ui";

import { CurrentAssessmentContent } from "./components/CurrentAssessmentContent";

const currentAssessmentHeadingId = "current-assessment-heading";

type CurrentAssessmentPanelProps = {
  assessment: AssessmentUpdate | null;
  onAssessmentAction?: () => void;
};

function CurrentAssessmentPanel({
  assessment,
  onAssessmentAction
}: CurrentAssessmentPanelProps) {
  const actionLabel = assessment ? "Update assessment" : "Add assessment";

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Assessment
            </p>
            <h2
              id={currentAssessmentHeadingId}
              className="mt-1 text-lg font-semibold"
            >
              Current assessment
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Latest active assessment update.
            </p>
          </div>
          <Button
            disabled={!onAssessmentAction}
            onClick={onAssessmentAction}
            size="sm"
            variant="outline"
          >
            {actionLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {assessment ? (
          <CurrentAssessmentContent assessment={assessment} />
        ) : (
          <EmptyState
            action={
              <span className="text-muted-foreground text-xs">
                Assessment composer coming in the next workflow.
              </span>
            }
            className="items-start px-0 py-2 text-left"
            description="Add an assessment update to record the current judgment, confidence, assumptions, and indicators for this dossier."
            title="No assessment yet"
          />
        )}
      </CardContent>
    </Card>
  );
}

export { CurrentAssessmentPanel, type CurrentAssessmentPanelProps };
