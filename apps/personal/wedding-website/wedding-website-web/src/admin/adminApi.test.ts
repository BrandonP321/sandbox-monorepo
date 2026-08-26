import { describe, expect, it, vi } from "vitest";

import { createAdminRsvpsUrl, listAdminRsvps } from "./adminApi";

const accessKey = "synthetic-admin-access-key";

function successPayload() {
  return {
    submissions: [
      {
        submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
        submittedAt: "2026-08-26T01:35:31.000Z",
        schemaVersion: 1,
        guestSide: "niamh",
        adults: [
          {
            name: "Synthetic Guest",
            attendance: "attending",
            contact: { email: "synthetic@example.test" }
          }
        ],
        childrenAttending: 0,
        contact: { phone: "+1 202 555 0100" }
      }
    ]
  };
}

describe("listAdminRsvps", () => {
  it("uses the protected GET route and validates a successful response", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(JSON.stringify(successPayload()), { status: 200 })
    );

    await expect(
      listAdminRsvps({
        accessKey,
        apiBaseUrl: "https://api.example.test/",
        fetcher
      })
    ).resolves.toEqual({ ok: true, submissions: successPayload().submissions });
    expect(createAdminRsvpsUrl("https://api.example.test/")).toBe(
      "https://api.example.test/admin/rsvps"
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/admin/rsvps",
      {
        method: "GET",
        headers: { authorization: `Bearer ${accessKey}` },
        cache: "no-store"
      }
    );
  });

  it("classifies unauthorized, malformed, server, and network failures safely", async () => {
    await expect(
      listAdminRsvps({
        accessKey,
        apiBaseUrl: "http://localhost:3001",
        fetcher: vi.fn(async () => new Response("{}", { status: 401 }))
      })
    ).resolves.toEqual({ ok: false, kind: "unauthorized" });

    for (const fetcher of [
      vi.fn(async () => new Response("{}", { status: 200 })),
      vi.fn(async () => new Response("{}", { status: 503 })),
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      })
    ]) {
      await expect(
        listAdminRsvps({
          accessKey,
          apiBaseUrl: "http://localhost:3001",
          fetcher
        })
      ).resolves.toEqual({ ok: false, kind: "unavailable" });
    }
  });
});
