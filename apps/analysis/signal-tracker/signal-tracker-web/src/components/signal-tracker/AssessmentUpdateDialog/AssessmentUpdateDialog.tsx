import type { ReactElement } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui";

import { AssessmentUpdateForm } from "../AssessmentUpdateForm";

type AssessmentUpdateDialogProps = {
  children: ReactElement;
  hasCurrentAssessment: boolean;
  topicId: string;
};

function AssessmentUpdateDialog({
  children,
  hasCurrentAssessment,
  topicId
}: AssessmentUpdateDialogProps) {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent
        className="max-w-2xl"
        description="Record the dated judgment, confidence, assumptions, and indicators that become the current assessment."
        title={hasCurrentAssessment ? "Update assessment" : "Add assessment"}
      >
        <AssessmentUpdateForm
          hasCurrentAssessment={hasCurrentAssessment}
          topicId={topicId}
        />
      </DialogContent>
    </Dialog>
  );
}

export { AssessmentUpdateDialog, type AssessmentUpdateDialogProps };
