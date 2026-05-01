import { describe, expect, it } from "vitest";

import {
  captureEvidenceUrlRequestSchema,
  captureEvidenceUrlResponseSchema,
  createEvidenceAnchorRequestSchema,
  createEvidenceItemRequestSchema,
  createEvidenceItemResponseSchema,
  evidenceAnchorSchema,
  evidenceItemSchema,
  getEvidenceItemRequestSchema,
  getEvidenceItemResponseSchema,
  listEvidenceItemsRequestSchema,
  listEvidenceItemsResponseSchema,
  sourceSchema,
  sourceTypeSchema
} from "./evidence-contracts.js";

describe("evidence contracts", () => {
  it("validates source type values", () => {
    expect(sourceTypeSchema.options).toEqual([
      "news",
      "government",
      "court",
      "academic",
      "think_tank",
      "organization",
      "user_uploaded",
      "other"
    ]);
  });

  it("validates source and evidence item shapes", () => {
    const source = sourceSchema.parse({
      id: " source-1 ",
      canonicalName: " Reuters ",
      baseUrl: " https://www.reuters.com ",
      sourceType: "news",
      notes: " Wire service ",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z"
    });
    const evidenceItem = evidenceItemSchema.parse({
      id: " evidence-1 ",
      sourceId: " source-1 ",
      canonicalUrl: " https://www.reuters.com/world/example ",
      title: " Court grants injunction ",
      author: " Jane Reporter ",
      publishedAt: " 2026-04-24T00:00:00.000Z ",
      capturedAt: "2026-04-25T00:00:00.000Z",
      contentType: " text/html ",
      language: " en ",
      snapshotHash: " sha256:abc123 ",
      storageKey: " evidence/evidence-1.html ",
      metadata: { outletSection: "World" },
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z"
    });

    expect(source).toEqual({
      id: "source-1",
      canonicalName: "Reuters",
      baseUrl: "https://www.reuters.com",
      sourceType: "news",
      notes: "Wire service",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z"
    });
    expect(evidenceItem).toMatchObject({
      id: "evidence-1",
      sourceId: "source-1",
      canonicalUrl: "https://www.reuters.com/world/example",
      title: "Court grants injunction",
      author: "Jane Reporter",
      metadata: { outletSection: "World" }
    });
  });

  it("validates manual evidence creation requests", () => {
    expect(
      createEvidenceItemRequestSchema.parse({
        source: {
          canonicalName: " User supplied document ",
          sourceType: "user_uploaded"
        },
        title: " Uploaded court filing "
      })
    ).toEqual({
      source: {
        canonicalName: "User supplied document",
        sourceType: "user_uploaded"
      },
      title: "Uploaded court filing"
    });

    expect(
      createEvidenceItemRequestSchema.parse({
        source: {
          canonicalName: "Reuters",
          baseUrl: "https://www.reuters.com",
          sourceType: "news"
        },
        canonicalUrl: " https://www.reuters.com/world/example ",
        title: " Article ",
        metadata: { capturedVia: "manual" }
      })
    ).toMatchObject({
      canonicalUrl: "https://www.reuters.com/world/example",
      title: "Article",
      metadata: { capturedVia: "manual" }
    });
  });

  it("rejects invalid evidence creation requests", () => {
    const validRequest = {
      source: {
        canonicalName: "Reuters",
        sourceType: "news"
      },
      title: "Court grants injunction"
    };

    expect(() =>
      createEvidenceItemRequestSchema.parse({
        ...validRequest,
        source: { ...validRequest.source, sourceType: "blog" }
      })
    ).toThrow();
    expect(() =>
      createEvidenceItemRequestSchema.parse({
        ...validRequest,
        source: { ...validRequest.source, canonicalName: " " }
      })
    ).toThrow();
    expect(() =>
      createEvidenceItemRequestSchema.parse({
        ...validRequest,
        title: " "
      })
    ).toThrow();
    expect(() =>
      createEvidenceItemRequestSchema.parse({
        ...validRequest,
        canonicalUrl: "not-a-url"
      })
    ).toThrow();
  });

  it("validates URL evidence capture requests", () => {
    expect(
      captureEvidenceUrlRequestSchema.parse({
        url: " https://www.reuters.com/world/example?utm_source=newsletter ",
        source: {
          canonicalName: " Reuters ",
          sourceType: "news",
          notes: " Wire service "
        },
        title: " Court grants injunction ",
        author: " Jane Reporter ",
        metadata: { submittedFrom: "postman" }
      })
    ).toEqual({
      url: "https://www.reuters.com/world/example?utm_source=newsletter",
      source: {
        canonicalName: "Reuters",
        sourceType: "news",
        notes: "Wire service"
      },
      title: "Court grants injunction",
      author: "Jane Reporter",
      metadata: { submittedFrom: "postman" }
    });
  });

  it("rejects invalid URL evidence capture requests", () => {
    expect(() => captureEvidenceUrlRequestSchema.parse({})).toThrow();
    expect(() =>
      captureEvidenceUrlRequestSchema.parse({ url: "not-a-url" })
    ).toThrow();
    expect(() =>
      captureEvidenceUrlRequestSchema.parse({ url: "ftp://example.com/file" })
    ).toThrow();
    expect(() =>
      captureEvidenceUrlRequestSchema.parse({
        url: "https://www.reuters.com/world/example",
        title: " "
      })
    ).toThrow();
    expect(() =>
      captureEvidenceUrlRequestSchema.parse({
        url: "https://www.reuters.com/world/example",
        source: { sourceType: "blog" }
      })
    ).toThrow();
  });

  it("validates read and response shapes", () => {
    expect(
      getEvidenceItemRequestSchema.parse({ evidenceItemId: " evidence-1 " })
    ).toEqual({ evidenceItemId: "evidence-1" });
    expect(() =>
      getEvidenceItemRequestSchema.parse({ evidenceItemId: " " })
    ).toThrow();

    const record = {
      source: {
        id: "source-1",
        canonicalName: "Reuters",
        sourceType: "news",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      },
      evidenceItem: {
        id: "evidence-1",
        sourceId: "source-1",
        title: "Court grants injunction",
        capturedAt: "2026-04-25T00:00:00.000Z",
        metadata: {},
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      }
    };

    expect(createEvidenceItemResponseSchema.parse(record)).toEqual(record);
    expect(captureEvidenceUrlResponseSchema.parse(record)).toEqual(record);
    expect(getEvidenceItemResponseSchema.parse(record)).toEqual(record);
    expect(
      listEvidenceItemsRequestSchema.parse({ query: " Reuters " })
    ).toEqual({ query: "Reuters" });
    expect(listEvidenceItemsRequestSchema.parse({})).toEqual({});
    expect(
      listEvidenceItemsResponseSchema.parse({ evidence: [record] })
    ).toEqual({
      evidence: [record]
    });
  });

  it("validates quote anchors with trimmed text", () => {
    expect(
      createEvidenceAnchorRequestSchema.parse({
        evidenceItemId: " evidence-1 ",
        quoteText: " Supporting passage ",
        prefix: " Before ",
        suffix: " After "
      })
    ).toEqual({
      evidenceItemId: "evidence-1",
      quoteText: "Supporting passage",
      prefix: "Before",
      suffix: "After",
      locator: {}
    });
  });

  it("validates page anchors", () => {
    expect(
      createEvidenceAnchorRequestSchema.parse({
        evidenceItemId: "evidence-1",
        pageLabel: " p. 14 "
      })
    ).toEqual({
      evidenceItemId: "evidence-1",
      pageLabel: "p. 14",
      locator: {}
    });
  });

  it("validates text position anchors with locator details", () => {
    expect(
      createEvidenceAnchorRequestSchema.parse({
        evidenceItemId: "evidence-1",
        startPos: 42,
        endPos: 84,
        locator: {
          selector: "TextPositionSelector"
        }
      })
    ).toEqual({
      evidenceItemId: "evidence-1",
      startPos: 42,
      endPos: 84,
      locator: {
        selector: "TextPositionSelector"
      }
    });
  });

  it("rejects anchors without locator fields", () => {
    expect(() =>
      createEvidenceAnchorRequestSchema.parse({
        evidenceItemId: "evidence-1",
        prefix: "Only context",
        suffix: "is not enough"
      })
    ).toThrow(/Provide quoteText, pageLabel, startPos\/endPos, or locator/);
  });

  it("rejects incomplete and unordered text position ranges", () => {
    expect(() =>
      createEvidenceAnchorRequestSchema.parse({
        evidenceItemId: "evidence-1",
        startPos: 42
      })
    ).toThrow(/startPos and endPos must be provided together/);

    expect(() =>
      createEvidenceAnchorRequestSchema.parse({
        evidenceItemId: "evidence-1",
        startPos: 84,
        endPos: 42
      })
    ).toThrow(/startPos must be less than or equal to endPos/);
  });

  it("validates persisted anchor responses", () => {
    expect(
      evidenceAnchorSchema.parse({
        id: "anchor-1",
        evidenceItemId: " evidence-1 ",
        pageLabel: " Page 1 ",
        locator: {},
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      })
    ).toMatchObject({
      id: "anchor-1",
      evidenceItemId: "evidence-1",
      pageLabel: "Page 1",
      locator: {}
    });
  });
});
