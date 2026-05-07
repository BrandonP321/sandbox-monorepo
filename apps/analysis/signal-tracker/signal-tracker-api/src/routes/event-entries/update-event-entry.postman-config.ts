import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("updateEventEntry", {
  folder: "Event Entries",
  name: "Update Event Entry",
  description: "Updates editable manual event entry fields.",
  exampleBody: {
    entryId: "entry-1",
    title: "Updated court injunction",
    bodyMd: "The injunction remains active after the latest court order.",
    sortAt: "2026-04-26T00:00:00.000Z",
    epistemicStatus: "observed",
    sources: [{ url: "https://www.reuters.com/world/updated-example" }]
  }
});
