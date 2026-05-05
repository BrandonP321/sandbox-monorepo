import {
  createAssessmentUpdateRequestSchema,
  type CreateAssessmentUpdateRequest
} from "@repo/signal-tracker-shared";

import { toDateStart, toOptionalDateStart } from "./date-input";
import { splitTextareaLines } from "./field-values";
import type { AssessmentUpdateComposerFormValues } from "./schema";

function createAssessmentUpdateRequest({
  topicId,
  values
}: {
  topicId: string;
  values: AssessmentUpdateComposerFormValues;
}): CreateAssessmentUpdateRequest {
  const resolutionCriteria = values.resolutionCriteria.trim();
  const targetResolvesAt = toOptionalDateStart(values.targetResolutionDate);

  return createAssessmentUpdateRequestSchema.parse({
    topicId,
    judgment: values.judgment,
    confidenceLabel: values.confidenceLabel,
    assumptions: splitTextareaLines(values.assumptions),
    indicators: splitTextareaLines(values.indicators),
    ...(values.probabilityPct === undefined
      ? {}
      : { probabilityPct: values.probabilityPct }),
    ...(resolutionCriteria === "" ? {} : { resolutionCriteria }),
    ...(targetResolvesAt === undefined ? {} : { targetResolvesAt }),
    sortAt: toDateStart(values.assessmentDate)
  });
}

export { createAssessmentUpdateRequest };
