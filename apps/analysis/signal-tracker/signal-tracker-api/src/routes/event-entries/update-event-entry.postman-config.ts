import { definePostmanRequest } from "@repo/postman-sync";
import {
  signalTrackerRoutes,
  updateEventEntryRequestSchema
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "updateEventEntry",
  route: signalTrackerRoutes.updateEventEntry,
  folder: "Event Entries",
  name: "Update Event Entry",
  description: "Updates editable manual event entry fields.",
  requestSchema: updateEventEntryRequestSchema,
  exampleBody: {
    entryId: "entry-1",
    title: "Updated court injunction",
    bodyMd: "The injunction remains active after the latest court order.",
    sortAt: "2026-04-26T00:00:00.000Z",
    epistemicStatus: "observed"
  }
});
