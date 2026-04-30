import { definePostmanRequest } from "@repo/postman-sync";
import {
  listEventEntriesRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "listEventEntries",
  route: signalTrackerRoutes.listEventEntries,
  folder: "Event Entries",
  name: "List Event Entries",
  description: "Lists active manual event entries for a tracked topic.",
  requestSchema: listEventEntriesRequestSchema,
  exampleBody: {
    topicId: "topic-1"
  }
});
