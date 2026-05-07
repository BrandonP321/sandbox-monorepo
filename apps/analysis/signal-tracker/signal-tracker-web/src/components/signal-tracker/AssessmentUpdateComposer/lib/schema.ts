import {
  assessmentConfidenceLabelSchema,
  entrySourceInputSchema,
  type AssessmentConfidenceLabel
} from "@repo/signal-tracker-shared";
import {
  getTodayDateInputValue,
  isDateInputValue,
  splitTextareaLines
} from "@repo/ui-base";
import { z } from "zod";

const assessmentDateMessage = "Choose an assessment date.";
const probabilityMessage = "Enter a whole-number probability from 0 to 100.";
const targetResolutionDateMessage = "Choose a valid target resolution date.";

// TODO: Can we use schema helpers here?
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
  probabilityPct: z
    .number()
    .int(probabilityMessage)
    .min(0, probabilityMessage)
    .max(100, probabilityMessage)
    .optional(),
  resolutionCriteria: z.string(),
  sources: z.array(entrySourceInputSchema),
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
    probabilityPct: undefined,
    resolutionCriteria: "",
    sources: [],
    targetResolutionDate: ""
  };
}

export {
  assessmentUpdateComposerSchema,
  confidenceOptions,
  createDefaultFormValues,
  type AssessmentUpdateComposerFormValues
};
