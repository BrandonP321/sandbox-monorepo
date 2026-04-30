import { definePostmanRequest } from "@repo/postman-sync";
import {
  listTopicsRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "listTopics",
  route: signalTrackerRoutes.listTopics,
  folder: "Topics",
  name: "List Topics",
  description: "Lists active tracked topic dossier containers.",
  requestSchema: listTopicsRequestSchema,
  exampleBody: {
    query: "risk"
  }
});
