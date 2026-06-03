import { describe, expect, it } from "vitest";

import {
  isSignalTrackerProtectedDemoTopicId,
  signalTrackerProtectedDemoTopicId
} from "./demo-topics.js";

describe("Signal Tracker demo topic guards", () => {
  it("identifies the protected demo topic ID", () => {
    expect(signalTrackerProtectedDemoTopicId).toBe(
      "3c3f7086-e40b-4320-a62f-24dd95b4c04d"
    );
    expect(
      isSignalTrackerProtectedDemoTopicId(signalTrackerProtectedDemoTopicId)
    ).toBe(true);
    expect(isSignalTrackerProtectedDemoTopicId("topic-1")).toBe(false);
  });
});
