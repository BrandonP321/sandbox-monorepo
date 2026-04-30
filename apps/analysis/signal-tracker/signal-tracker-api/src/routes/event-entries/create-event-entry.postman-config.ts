import { definePostmanRequest } from "@repo/postman-sync";
import {
  createEventEntryRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "createEventEntry",
  route: signalTrackerRoutes.createEventEntry,
  folder: "Event Entries",
  name: "Create Event Entry",
  description: "Creates a manual dated event entry inside a tracked topic.",
  requestSchema: createEventEntryRequestSchema,
  exampleBody: {
    topicId: "topic-1",
    title: "Court grants injunction",
    bodyMd: "A federal court granted an injunction.",
    sortAt: "2026-04-25T00:00:00.000Z",
    epistemicStatus: "reported"
  }
});
