import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("listEvidenceAnchorsForItem", {
  folder: "Evidence",
  name: "List Evidence Anchors For Item",
  description:
    "Lists precise anchors that belong to an existing evidence item.",
  exampleBody: {
    evidenceItemId: "evidence-1"
  }
});
