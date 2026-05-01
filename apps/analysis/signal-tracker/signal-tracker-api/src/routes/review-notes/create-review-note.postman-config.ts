import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("createReviewNote", {
  folder: "Review Notes",
  name: "Create Review Note",
  description:
    "Creates a manual review note entry inside a tracked topic without updating the current assessment.",
  exampleBody: {
    topicId: "topic-1",
    title: "Weekly review",
    bodyMd: "No major developments since the prior review.",
    sortAt: "2026-04-25T00:00:00.000Z",
    epistemicStatus: "observed"
  }
});
