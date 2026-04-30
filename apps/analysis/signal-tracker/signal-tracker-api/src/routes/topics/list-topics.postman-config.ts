import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("listTopics", {
  folder: "Topics",
  name: "List Topics",
  description: "Lists active tracked topic dossier containers.",
  exampleBody: {
    query: "risk"
  }
});
