import { definePostmanRequest } from "@repo/postman-sync";
import {
  deleteTopicRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "deleteTopic",
  route: signalTrackerRoutes.deleteTopic,
  folder: "Topics",
  name: "Delete Topic",
  description: "Permanently hard deletes a topic row.",
  requestSchema: deleteTopicRequestSchema,
  exampleBody: {
    topicId: "topic-1"
  }
});
