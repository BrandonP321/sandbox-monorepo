import { z } from "zod";

import { entrySourceInputSchema } from "@repo/signal-tracker-shared";

const entrySourceManagerSchema = z.object({
  sources: z.array(entrySourceInputSchema)
});

type EntrySourceManagerFormValues = z.input<typeof entrySourceManagerSchema>;

export { entrySourceManagerSchema, type EntrySourceManagerFormValues };
