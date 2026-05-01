import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("createEvidenceAnchor", {
  folder: "Evidence",
  name: "Create Evidence Anchor",
  description:
    "Creates a precise quote, page, text-position, or locator anchor inside an existing evidence item.",
  exampleBody: {
    evidenceItemId: "evidence-1",
    quoteText: "A federal court granted an injunction.",
    prefix: "Earlier context.",
    suffix: "Later context.",
    locator: {
      selector: "manual_quote"
    }
  }
});
