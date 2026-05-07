import {
  createAssessmentUpdateRequestSchema,
  type CreateAssessmentUpdateRequest,
  type EntrySourceInput
} from "@repo/signal-tracker-shared";
import { splitTextareaLines } from "@repo/ui-base";

import { toDateStart, toOptionalDateStart } from "./date-input";
import type { AssessmentUpdateComposerFormValues } from "./schema";

function createAssessmentUpdateRequest({
  sourceUrls,
  topicId,
  values
}: {
  sourceUrls: string[];
  topicId: string;
  values: AssessmentUpdateComposerFormValues;
}): CreateAssessmentUpdateRequest {
  const resolutionCriteria = values.resolutionCriteria.trim();
  const targetResolvesAt = toOptionalDateStart(values.targetResolutionDate);
  const sources = createSourceInputs(sourceUrls);

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
    ...(sources.length === 0 ? {} : { sources })
  });
}

function createSourceInputs(sourceUrls: string[]): EntrySourceInput[] {
  return sourceUrls.map((url) => ({ url }));
}

export { createAssessmentUpdateRequest };
