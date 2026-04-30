import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("createTopic", {
  folder: "Topics",
  name: "Create Topic",
  description: "Creates a new tracked topic dossier container.",
  exampleBody: {
    title: "Iran strike risk",
    framingQuestion: "Will U.S.-Iran tensions escalate within the next month?",
    scopeNote:
      "Track military posture, official statements, diplomacy, and credible reporting.",
    reviewCadence: "weekly"
  }
});
