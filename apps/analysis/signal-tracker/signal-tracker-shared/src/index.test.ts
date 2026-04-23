import { describe, expect, it } from "vitest";

import {
  signalTrackerHealthResponseSchema,
  signalTrackerRouteEntries,
  signalTrackerRouteList,
  signalTrackerRoutes
} from "./index.js";

describe("signalTrackerRoutes", () => {
  it("defines the signal tracker API routes once for all consumers", () => {
    expect(signalTrackerRoutes.getHealth).toEqual({
      method: "POST",
      path: "/get-health"
    });
  });

  it("exposes stable list and entry helpers", () => {
    expect(
      signalTrackerRouteEntries.map(
        ([name]: (typeof signalTrackerRouteEntries)[number]) => name
      )
    ).toEqual(["getHealth"]);
    expect(signalTrackerRouteList).toEqual([signalTrackerRoutes.getHealth]);
  });

  it("validates the health response payload", () => {
    const payload = signalTrackerHealthResponseSchema.parse({ ok: true });

    expect(payload.ok).toBe(true);
  });
});
