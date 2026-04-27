import { definePostmanRequest } from "@repo/postman-sync";
import {
  getTopicRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "getTopic",
  route: signalTrackerRoutes.getTopic,
  folder: "Topics",
  name: "Get Topic",
  description: "Reads one tracked topic dossier container by ID.",
  requestSchema: getTopicRequestSchema,
  exampleBody: {
    topicId: "topic-1"
  }
});
