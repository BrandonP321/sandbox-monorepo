import { definePostmanRequest } from "@repo/postman-sync";
import {
  signalTrackerRoutes,
  updateTopicRequestSchema
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "updateTopic",
  route: signalTrackerRoutes.updateTopic,
  folder: "Topics",
  name: "Update Topic",
  description: "Updates editable topic dossier metadata.",
  requestSchema: updateTopicRequestSchema,
  exampleBody: {
    topicId: "topic-1",
    title: "Iran strike risk",
    framingQuestion: "Will U.S.-Iran tensions escalate within the next month?",
    scopeNote:
      "Track military posture, official statements, diplomacy, and credible reporting.",
    reviewCadence: "weekly"
  }
});
