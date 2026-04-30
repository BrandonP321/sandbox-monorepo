import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("listEventEntries", {
  folder: "Event Entries",
  name: "List Event Entries",
  description: "Lists active manual event entries for a tracked topic.",
  exampleBody: {
    topicId: "topic-1"
  }
});
