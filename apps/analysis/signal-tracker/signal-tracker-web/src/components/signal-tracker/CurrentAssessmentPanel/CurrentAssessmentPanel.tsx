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
  return (
    <Card className="flex max-h-[calc(100vh-18rem)] flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <ContentHeader
          actions={
            assessment ? (
              <AssessmentUpdateDialog hasCurrentAssessment topicId={topicId}>
                <Button size="sm" variant="outline">
                  Update assessment
                </Button>
              </AssessmentUpdateDialog>
            ) : undefined
          }
          description="Latest active assessment update."
          headingLevel={2}
          headingSize="h3"
          title="Current assessment"
        />
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {assessment ? (
          <CurrentAssessmentContent assessment={assessment} />
        ) : (
          <EmptyState
            action={
              <AssessmentUpdateDialog
                hasCurrentAssessment={false}
                topicId={topicId}
              >
                <Button variant="outline">Add assessment</Button>
              </AssessmentUpdateDialog>
            }
            description="The latest assessment update will appear here once one has been added to this topic."
            title="No assessment yet"
          />
        )}
      </CardContent>
    </Card>
  );
}

export { CurrentAssessmentPanel, type CurrentAssessmentPanelProps };
