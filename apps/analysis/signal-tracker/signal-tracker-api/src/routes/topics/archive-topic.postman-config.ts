import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("archiveTopic", {
  folder: "Topics",
  name: "Archive Topic",
  description:
    "Non-destructively archives a topic without deleting analytical history.",
  exampleBody: {
    topicId: "topic-1"
  }
});
