import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("createEvidenceItem", {
  folder: "Evidence",
  name: "Create Evidence Item",
  description:
    "Creates a manual reusable evidence item and creates or reuses its normalized source.",
  exampleBody: {
    source: {
      canonicalName: "Reuters",
      baseUrl: "https://www.reuters.com",
      sourceType: "news"
    },
    canonicalUrl: "https://www.reuters.com/world/example",
    title: "Court grants injunction",
    author: "Jane Reporter",
    publishedAt: "2026-04-24T00:00:00.000Z",
    contentType: "text/html",
    language: "en",
    metadata: {
      capturedVia: "manual"
    }
  }
});
