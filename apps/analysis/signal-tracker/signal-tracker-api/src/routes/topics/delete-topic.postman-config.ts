import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("deleteTopic", {
  folder: "Topics",
  name: "Delete Topic",
  description: "Permanently hard deletes a topic row.",
  exampleBody: {
    topicId: "topic-1"
  }
});
