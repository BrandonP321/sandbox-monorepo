import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("attachEntryCitation", {
  folder: "Citations",
  name: "Attach Entry Citation",
  description:
    "Links an entry to a reusable evidence item, optionally narrowed to an evidence anchor.",
  exampleBody: {
    entryId: "entry-1",
    evidenceItemId: "evidence-1",
    evidenceAnchorId: "anchor-1",
    relationType: "supports",
    note: "Supports the event wording."
  }
});
