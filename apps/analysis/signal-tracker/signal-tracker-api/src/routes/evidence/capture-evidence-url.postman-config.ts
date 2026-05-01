import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("captureEvidenceUrl", {
  folder: "Evidence",
  name: "Capture Evidence URL",
  description:
    "Captures a pasted URL as a reusable evidence item with deterministic URL normalization and minimal source inference.",
  exampleBody: {
    url: "https://www.reuters.com/world/example?utm_source=newsletter",
    source: {
      canonicalName: "Reuters",
      sourceType: "news"
    },
    title: "Court grants injunction",
    metadata: {
      submittedFrom: "postman"
    }
  }
});
