import { defineSignalTrackerPostmanRequest } from "../postman-request";

export default defineSignalTrackerPostmanRequest("getReviewNote", {
  folder: "Review Notes",
  name: "Get Review Note",
  description: "Retrieves a review note entry by ID.",
  exampleBody: {
    entryId: "review-1"
  }
});
