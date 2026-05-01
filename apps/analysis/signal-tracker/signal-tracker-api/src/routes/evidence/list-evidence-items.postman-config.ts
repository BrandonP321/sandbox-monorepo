import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("listEvidenceItems", {
  folder: "Evidence",
  name: "List Evidence Items",
  description:
    "Lists reusable evidence items and their normalized sources for citation attachment.",
  exampleBody: {
    query: "reuters"
  }
});
