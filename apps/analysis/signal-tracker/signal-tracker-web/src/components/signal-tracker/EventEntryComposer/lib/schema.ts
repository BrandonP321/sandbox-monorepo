import {
  entryEpistemicStatusSchema,
  type Entry,
  type EntryEpistemicStatus
} from "@repo/signal-tracker-shared";
import { getTodayDateInputValue, isDateInputValue } from "@repo/ui-base";
import { z } from "zod";

import { toDateInputValue } from "./date-input";

const eventDateMessage = "Choose an event date.";

const eventEntryFormSchema = z.object({
  bodyMd: z.string().trim().min(1, "Enter event details."),
  epistemicStatus: z
    .string()
    .refine(
      (value) => entryEpistemicStatusSchema.safeParse(value).success,
      "Choose a valid epistemic status."
    ),
  eventDate: z
    .string()
    .trim()
    .min(1, eventDateMessage)
    .refine(isDateInputValue, eventDateMessage),
  title: z.string().trim().min(1, "Enter an event title.")
});

type EventEntryFormValues = z.input<typeof eventEntryFormSchema>;

const epistemicStatusOptions = [
  { label: "Observed", value: "observed" },
  { label: "Reported", value: "reported" },
  { label: "Inferred", value: "inferred" },
  { label: "Forecast", value: "forecast" }
] satisfies Array<{ label: string; value: EntryEpistemicStatus }>;

function createDefaultFormValues(): EventEntryFormValues {
  return {
    bodyMd: "",
    epistemicStatus: "",
    eventDate: getTodayDateInputValue(),
    title: ""
  };
}

function createEditFormValues(entry: Entry): EventEntryFormValues {
  return {
    bodyMd: entry.bodyMd,
    epistemicStatus: entry.epistemicStatus,
    eventDate: toDateInputValue(entry.sortAt),
    title: entry.title
  };
}

export {
  createDefaultFormValues,
  createEditFormValues,
  epistemicStatusOptions,
  eventEntryFormSchema,
  type EventEntryFormValues
};
