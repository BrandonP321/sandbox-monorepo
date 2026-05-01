import { describe, expect, it, vi } from "vitest";

import {
  buildEvidenceItemRequest,
  canonicalizeEvidenceUrl,
  captureEvidenceUrlRecord
} from "./capture-evidence-url";
import { InMemoryEvidenceRepository } from "./evidence-repository";

describe("captureEvidenceUrlRecord", () => {
  it("canonicalizes URL input deterministically", () => {
    expect(
      canonicalizeEvidenceUrl(
        " HTTPS://WWW.REUTERS.COM:443/world/example?utm_source=newsletter&b=2&a=1&fbclid=abc#section "
      )
    ).toBe("https://www.reuters.com/world/example?a=1&b=2");
    expect(canonicalizeEvidenceUrl("http://Example.com:80/path?b=2&a=1")).toBe(
      "http://example.com/path?a=1&b=2"
    );
  });

  it("rejects unsupported URL protocols", () => {
    expect(() => canonicalizeEvidenceUrl("ftp://example.com/file")).toThrow(
      "Evidence URL must use http or https"
    );
  });

  it("builds evidence creation input from a pasted URL", () => {
    expect(
      buildEvidenceItemRequest({
        url: "https://www.reuters.com/world/court-grants-injunction?utm_medium=email",
        metadata: { submittedFrom: "postman", captureMethod: "caller" }
      })
    ).toEqual({
      source: {
        canonicalName: "www.reuters.com",
        baseUrl: "https://www.reuters.com",
        sourceType: "other"
      },
      canonicalUrl: "https://www.reuters.com/world/court-grants-injunction",
      title: "court grants injunction",
      metadata: {
        submittedFrom: "postman",
        captureMethod: "url_paste",
        originalUrl:
          "https://www.reuters.com/world/court-grants-injunction?utm_medium=email"
      }
    });
  });

  it("respects explicit source and evidence metadata overrides", () => {
    expect(
      buildEvidenceItemRequest({
        url: "https://www.reuters.com/world/example",
        source: {
          canonicalName: "Reuters",
          sourceType: "news",
          notes: "Wire service"
        },
        title: "Court grants injunction",
        author: "Jane Reporter",
        publishedAt: "2026-04-24T00:00:00.000Z",
        contentType: "text/html",
        language: "en"
      })
    ).toMatchObject({
      source: {
        canonicalName: "Reuters",
        baseUrl: "https://www.reuters.com",
        sourceType: "news",
        notes: "Wire service"
      },
      title: "Court grants injunction",
      author: "Jane Reporter",
      publishedAt: "2026-04-24T00:00:00.000Z",
      contentType: "text/html",
      language: "en"
    });
  });

  it("creates reusable evidence through the existing evidence repository", async () => {
    const repository = new InMemoryEvidenceRepository();

    await expect(
      captureEvidenceUrlRecord(
        {
          url: "https://www.reuters.com/world/example?utm_source=newsletter",
          source: { canonicalName: "Reuters", sourceType: "news" },
          title: "Court grants injunction"
        },
        {
          repository,
          generateId: vi
            .fn(() => "unused")
            .mockReturnValueOnce("source-1")
            .mockReturnValueOnce("evidence-1"),
          now: () => new Date("2026-04-25T00:00:00.000Z")
        }
      )
    ).resolves.toEqual({
      source: {
        id: "source-1",
        canonicalName: "Reuters",
        baseUrl: "https://www.reuters.com",
        sourceType: "news",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      },
      evidenceItem: {
        id: "evidence-1",
        sourceId: "source-1",
        canonicalUrl: "https://www.reuters.com/world/example",
        title: "Court grants injunction",
        capturedAt: "2026-04-25T00:00:00.000Z",
        metadata: {
          originalUrl:
            "https://www.reuters.com/world/example?utm_source=newsletter",
          captureMethod: "url_paste"
        },
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      }
    });
  });

  it("returns existing evidence for duplicate canonical URLs", async () => {
    const repository = new InMemoryEvidenceRepository();
    const firstRecord = await captureEvidenceUrlRecord(
      {
        url: "https://www.reuters.com/world/example?b=2&a=1",
        title: "Original title"
      },
      {
        repository,
        generateId: vi
          .fn(() => "unused")
          .mockReturnValueOnce("source-1")
          .mockReturnValueOnce("evidence-1"),
        now: () => new Date("2026-04-25T00:00:00.000Z")
      }
    );
    const duplicateRecord = await captureEvidenceUrlRecord(
      {
        url: "https://www.reuters.com/world/example?a=1&b=2#ignored",
        title: "Duplicate title"
      },
      {
        repository,
        generateId: vi
          .fn(() => "unused")
          .mockReturnValueOnce("source-2")
          .mockReturnValueOnce("evidence-2"),
        now: () => new Date("2026-04-26T00:00:00.000Z")
      }
    );

    expect(duplicateRecord).toEqual(firstRecord);
    await expect(repository.findById("evidence-2")).resolves.toBeUndefined();
  });

  it("reuses source records by derived base URL", async () => {
    const repository = new InMemoryEvidenceRepository();
    const firstRecord = await captureEvidenceUrlRecord(
      {
        url: "https://www.reuters.com/world/first",
        source: { canonicalName: "Reuters", sourceType: "news" },
        title: "First article"
      },
      {
        repository,
        generateId: vi
          .fn(() => "unused")
          .mockReturnValueOnce("source-1")
          .mockReturnValueOnce("evidence-1"),
        now: () => new Date("2026-04-25T00:00:00.000Z")
      }
    );
    const secondRecord = await captureEvidenceUrlRecord(
      {
        url: "https://www.reuters.com/world/second",
        title: "Second article"
      },
      {
        repository,
        generateId: vi
          .fn(() => "unused")
          .mockReturnValueOnce("source-2")
          .mockReturnValueOnce("evidence-2"),
        now: () => new Date("2026-04-26T00:00:00.000Z")
      }
    );

    expect(secondRecord.source).toEqual(firstRecord.source);
    expect(secondRecord.evidenceItem).toMatchObject({
      id: "evidence-2",
      sourceId: firstRecord.source.id
    });
  });
});
