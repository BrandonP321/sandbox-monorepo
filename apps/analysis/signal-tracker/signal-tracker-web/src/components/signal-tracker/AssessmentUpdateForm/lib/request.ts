import {
  createAssessmentUpdateRequestSchema,
  type CreateAssessmentUpdateRequest
} from "@repo/signal-tracker-shared";
import { splitTextareaLines } from "@repo/ui-base";

import { toDateStart, toOptionalDateStart } from "./date-input";
import type { AssessmentUpdateFormValues } from "./schema";

function createAssessmentUpdateRequest({
  topicId,
  values
}: {
  topicId: string;
  values: AssessmentUpdateFormValues;
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
    sortAt: toDateStart(values.assessmentDate),
    ...(values.sources.length === 0 ? {} : { sources: values.sources })
  });
}

export { createAssessmentUpdateRequest };
