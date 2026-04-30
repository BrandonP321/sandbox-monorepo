import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("updateTopic", {
  folder: "Topics",
  name: "Update Topic",
  description: "Updates editable topic dossier metadata.",
  exampleBody: {
    topicId: "topic-1",
    title: "Iran strike risk",
    framingQuestion: "Will U.S.-Iran tensions escalate within the next month?",
    scopeNote:
      "Track military posture, official statements, diplomacy, and credible reporting.",
    reviewCadence: "weekly"
  }
});
