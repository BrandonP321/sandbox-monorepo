import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("getEvidenceAnchor", {
  folder: "Evidence",
  name: "Get Evidence Anchor",
  description: "Reads one precise evidence anchor by ID.",
  exampleBody: {
    anchorId: "anchor-1"
  }
});
