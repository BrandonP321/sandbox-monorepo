import { expect, vi, type Mock } from "vitest";

import {
  signalTrackerRouteContracts,
  type AssessmentUpdate,
  type Entry,
  type EntryCitationRecord,
  type EvidenceAnchor,
  type EvidenceItem,
  type EvidenceRecord,
  type SignalTrackerRouteName,
  type SignalTrackerRouteRequest,
  type SignalTrackerRouteResponse,
  type Source,
  type Topic
} from "@repo/signal-tracker-shared";

export const apiBaseUrl = "https://signal-tracker-api.test";

export const topic = {
  id: "topic-1",
  title: "Topic 1",
  framingQuestion: "What changed?",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  scopeNote: undefined,
  reviewCadence: "weekly"
} as const satisfies Topic;

export const eventEntry = {
  id: "entry-1",
  topicId: topic.id,
  kind: "event",
  epistemicStatus: "reported",
  title: "Event 1",
  bodyMd: "A reported event.",
  sortAt: "2026-01-02T00:00:00.000Z",
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z"
} as const satisfies Entry;

export const assessmentEntry = {
  ...eventEntry,
  id: "assessment-entry-1",
  kind: "assessment",
  title: "Assessment 1"
} as const satisfies Entry;

export const assessmentUpdate = {
  entry: assessmentEntry,
  judgment: "Risk is rising.",
  confidenceLabel: "medium",
  probabilityPct: 55,
  assumptions: ["Negotiations remain stalled."],
  indicators: ["Official statements change."],
  resolutionCriteria: "Escalation is confirmed.",
  targetResolvesAt: "2026-06-01T00:00:00.000Z",
  previousAssessmentEntryId: undefined
} satisfies AssessmentUpdate;

export const source = {
  id: "source-1",
  canonicalName: "Agency",
  sourceType: "government",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
} as const satisfies Source;

export const evidenceItem = {
  id: "evidence-1",
  sourceId: source.id,
  canonicalUrl: "https://agency.example/report",
  title: "Evidence",
  capturedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  metadata: {}
} as const satisfies EvidenceItem;

export const evidenceRecord = {
  source,
  evidenceItem
} as const satisfies EvidenceRecord;

export const evidenceAnchor = {
  id: "anchor-1",
  evidenceItemId: evidenceItem.id,
  quoteText: "Important source text",
  locator: {},
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
} as const satisfies EvidenceAnchor;

export const citationRecord = {
  citation: {
    id: "citation-1",
    entryId: eventEntry.id,
    evidenceItemId: evidenceItem.id,
    evidenceAnchorId: evidenceAnchor.id,
    relationType: "supports",
    note: undefined,
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  evidence: evidenceRecord,
  anchor: evidenceAnchor
} as const satisfies EntryCitationRecord;

export function stubRouteResponse<TName extends SignalTrackerRouteName>(
  _routeName: TName,
  body: SignalTrackerRouteResponse<TName>
): Mock {
  const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(body));

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

export function createJsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json"
    }
  });
}

export async function expectRouteRequest<TName extends SignalTrackerRouteName>(
  fetchMock: Mock,
  routeName: TName,
  body: SignalTrackerRouteRequest<TName>
) {
  const contract = signalTrackerRouteContracts[routeName];
  const request = getFetchRequest(fetchMock);

  expect(request.url).toBe(`${apiBaseUrl}${contract.route.path}`);
  expect(request.method).toBe(contract.route.method);
  expect(await request.clone().json()).toEqual(
    JSON.parse(JSON.stringify(contract.requestSchema.parse(body)))
  );
}

function getFetchRequest(fetchMock: Mock): Request {
  const [input, init] = fetchMock.mock.calls[0] ?? [];

  if (input instanceof Request) {
    return input;
  }

  return new Request(input as RequestInfo | URL, init as RequestInit);
}
