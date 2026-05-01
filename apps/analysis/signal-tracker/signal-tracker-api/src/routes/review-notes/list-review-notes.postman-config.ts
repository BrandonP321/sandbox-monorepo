import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("listReviewNotes", {
  folder: "Review Notes",
  name: "List Review Notes",
  description: "Lists active manual review note entries for a tracked topic.",
  exampleBody: {
    topicId: "topic-1"
  }
});
