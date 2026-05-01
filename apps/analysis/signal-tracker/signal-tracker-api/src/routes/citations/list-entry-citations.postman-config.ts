import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("listEntryCitations", {
  folder: "Citations",
  name: "List Entry Citations",
  description:
    "Lists evidence citations attached to an entry, newest first, including evidence and anchor display data.",
  exampleBody: {
    entryId: "entry-1"
  }
});
