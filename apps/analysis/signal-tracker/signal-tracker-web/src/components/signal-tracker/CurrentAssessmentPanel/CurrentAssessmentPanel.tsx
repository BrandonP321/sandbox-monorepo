import type { AssessmentUpdate } from "@repo/signal-tracker-shared";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  ContentHeader,
  EmptyState
} from "@/components/ui";

import { CurrentAssessmentContent } from "./components/CurrentAssessmentContent";

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
        <ContentHeader
          actions={
            <Button
              disabled={!onAssessmentAction}
              onClick={onAssessmentAction}
              size="sm"
              variant="outline"
            >
              {actionLabel}
            </Button>
          }
          description="Latest active assessment update."
          eyebrow="Assessment"
          headingLevel={2}
          headingSize="h3"
          title="Current assessment"
        />
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
