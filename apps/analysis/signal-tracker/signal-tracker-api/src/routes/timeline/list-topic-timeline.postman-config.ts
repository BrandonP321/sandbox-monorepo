import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("listTopicTimeline", {
  folder: "Timeline",
  name: "List Topic Timeline",
  description:
    "Lists active event, assessment update, and review note timeline items for a tracked topic. Omit limit for full active history or provide limit for recent retrieval.",
  exampleBody: {
    topicId: "topic-1"
  }
});
