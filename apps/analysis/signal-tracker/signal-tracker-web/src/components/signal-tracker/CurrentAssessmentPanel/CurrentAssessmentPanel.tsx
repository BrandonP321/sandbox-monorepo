import type { AssessmentUpdateReadModel } from "@repo/signal-tracker-shared";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  ContentHeader,
  EmptyState
} from "@/components/ui";

import { AssessmentUpdateDialog } from "../AssessmentUpdateDialog";
import { CurrentAssessmentContent } from "./components/CurrentAssessmentContent";

type CurrentAssessmentPanelProps = {
  assessment: AssessmentUpdateReadModel | null;
  topicId: string;
};

function CurrentAssessmentPanel({
  assessment,
  topicId
}: CurrentAssessmentPanelProps) {
  const actionLabel = assessment ? "Update assessment" : "Add assessment";

  return (
    <Card>
      <CardHeader>
        <ContentHeader
          actions={
            <AssessmentUpdateDialog
              hasCurrentAssessment={assessment !== null}
              topicId={topicId}
            >
              <Button size="sm" variant="outline">
                {actionLabel}
              </Button>
            </AssessmentUpdateDialog>
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
