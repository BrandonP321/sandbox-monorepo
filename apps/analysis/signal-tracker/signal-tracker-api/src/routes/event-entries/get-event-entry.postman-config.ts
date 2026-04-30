import { definePostmanRequest } from "@repo/postman-sync";
import {
  getEventEntryRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "getEventEntry",
  route: signalTrackerRoutes.getEventEntry,
  folder: "Event Entries",
  name: "Get Event Entry",
  description: "Reads one event entry by ID.",
  requestSchema: getEventEntryRequestSchema,
  exampleBody: {
    entryId: "entry-1"
  }
});
