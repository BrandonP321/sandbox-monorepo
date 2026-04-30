import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("getTopic", {
  folder: "Topics",
  name: "Get Topic",
  description: "Reads one tracked topic dossier container by ID.",
  exampleBody: {
    topicId: "topic-1"
  }
});
