import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("detachEntryCitation", {
  folder: "Citations",
  name: "Detach Entry Citation",
  description:
    "Removes one citation relationship from an entry without deleting the entry or evidence item.",
  exampleBody: {
    entryId: "entry-1",
    citationId: "citation-1"
  }
});
