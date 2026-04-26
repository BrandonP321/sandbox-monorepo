import { definePostmanRequest } from "@repo/postman-sync";
import {
  createTopicRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "createTopic",
  route: signalTrackerRoutes.createTopic,
  folder: "Topics",
  name: "Create Topic",
  description: "Creates a new tracked topic dossier container.",
  requestSchema: createTopicRequestSchema,
  exampleBody: {
    title: "Iran strike risk",
    framingQuestion: "Will U.S.-Iran tensions escalate within the next month?",
    scopeNote:
      "Track military posture, official statements, diplomacy, and credible reporting.",
    reviewCadence: "weekly"
  }
});
