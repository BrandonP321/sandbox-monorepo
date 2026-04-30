import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("getEventEntry", {
  folder: "Event Entries",
  name: "Get Event Entry",
  description: "Reads one event entry by ID.",
  exampleBody: {
    entryId: "entry-1"
  }
});
