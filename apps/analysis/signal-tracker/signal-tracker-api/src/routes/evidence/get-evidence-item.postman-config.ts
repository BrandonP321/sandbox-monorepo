import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("getEvidenceItem", {
  folder: "Evidence",
  name: "Get Evidence Item",
  description: "Reads a reusable evidence item and its normalized source.",
  exampleBody: {
    evidenceItemId: "evidence-1"
  }
});
