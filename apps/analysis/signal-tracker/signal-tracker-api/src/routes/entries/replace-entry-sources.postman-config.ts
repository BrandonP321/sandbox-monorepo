import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("replaceEntrySources", {
  folder: "Entries",
  name: "Replace Entry Sources",
  description: "Replaces the managed source URL list for an existing entry.",
  exampleBody: {
    entryId: "entry-1",
    sources: [{ url: "https://www.reuters.com/world/updated-example" }]
  }
});
