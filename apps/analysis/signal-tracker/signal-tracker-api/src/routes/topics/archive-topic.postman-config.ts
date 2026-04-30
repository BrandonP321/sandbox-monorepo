import { definePostmanRequest } from "@repo/postman-sync";
import {
  archiveTopicRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "archiveTopic",
  route: signalTrackerRoutes.archiveTopic,
  folder: "Topics",
  name: "Archive Topic",
  description: "Archives a topic without deleting analytical history.",
  requestSchema: archiveTopicRequestSchema,
  exampleBody: {
    topicId: "topic-1"
  }
});
