import {
  assessmentConfidenceLabelSchema,
  type AssessmentConfidenceLabel
} from "@repo/signal-tracker-shared";
import { z } from "zod";

import { getTodayDateInputValue, isDateInputValue } from "./date-input";
import { isOptionalProbability, splitTextareaLines } from "./field-values";

const assessmentDateMessage = "Choose an assessment date.";
const targetResolutionDateMessage = "Choose a valid target resolution date.";

const assessmentUpdateComposerSchema = z.object({
  assessmentDate: z
    .string()
    .trim()
    .min(1, assessmentDateMessage)
    .refine(isDateInputValue, assessmentDateMessage),
  assumptions: z
    .string()
    .refine(
      (value) => splitTextareaLines(value).length > 0,
      "Enter at least one assumption."
    ),
  confidenceLabel: z
    .string()
    .refine(
      (value) => assessmentConfidenceLabelSchema.safeParse(value).success,
      "Choose a valid confidence label."
    ),
  indicators: z
    .string()
    .refine(
      (value) => splitTextareaLines(value).length > 0,
      "Enter at least one indicator."
    ),
  judgment: z.string().trim().min(1, "Enter an assessment judgment."),
  probabilityPct: z.string().trim().refine(isOptionalProbability, {
    message: "Enter a whole-number probability from 0 to 100."
  }),
  resolutionCriteria: z.string(),
  targetResolutionDate: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isDateInputValue(value),
      targetResolutionDateMessage
    )
});

type AssessmentUpdateComposerFormValues = z.input<
  typeof assessmentUpdateComposerSchema
>;

const confidenceOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" }
] satisfies Array<{ label: string; value: AssessmentConfidenceLabel }>;

function createDefaultFormValues(): AssessmentUpdateComposerFormValues {
  return {
    assessmentDate: getTodayDateInputValue(),
    assumptions: "",
    confidenceLabel: "",
    indicators: "",
    judgment: "",
    probabilityPct: "",
    resolutionCriteria: "",
    targetResolutionDate: ""
  };
}

export {
  assessmentUpdateComposerSchema,
  confidenceOptions,
  createDefaultFormValues,
  type AssessmentUpdateComposerFormValues
};
