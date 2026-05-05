import { Dialog, DialogContent } from "@/components/ui";

import { AssessmentUpdateComposerForm } from "./components/AssessmentUpdateComposerForm";

type AssessmentUpdateComposerProps = {
  hasCurrentAssessment: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  topicId: string;
};

function AssessmentUpdateComposer({
  hasCurrentAssessment,
  onOpenChange,
  open,
  topicId
}: AssessmentUpdateComposerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        description="Record the dated judgment, confidence, assumptions, and indicators that become the current assessment."
        title={hasCurrentAssessment ? "Update assessment" : "Add assessment"}
      >
        <AssessmentUpdateComposerForm
          hasCurrentAssessment={hasCurrentAssessment}
          topicId={topicId}
        />
      </DialogContent>
    </Dialog>
  );
}

export { AssessmentUpdateComposer, type AssessmentUpdateComposerProps };
