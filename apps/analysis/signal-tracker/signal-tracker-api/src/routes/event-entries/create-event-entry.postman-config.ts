import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("createEventEntry", {
  folder: "Event Entries",
  name: "Create Event Entry",
  description: "Creates a manual dated event entry inside a tracked topic.",
  exampleBody: {
    topicId: "topic-1",
    title: "Court grants injunction",
    bodyMd: "A federal court granted an injunction.",
    sortAt: "2026-04-25T00:00:00.000Z",
    epistemicStatus: "reported",
    sources: [{ url: "https://www.reuters.com/world/example" }]
  }
});
