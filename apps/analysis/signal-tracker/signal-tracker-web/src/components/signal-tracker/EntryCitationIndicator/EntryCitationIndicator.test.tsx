import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  AttachedSourceSummary,
  AttachEntryCitationResponse,
  DetachEntryCitationResponse,
  EntryCitationRecord,
  EvidenceRecord,
  ListEntryCitationsResponse,
  ListEvidenceItemsResponse
} from "@repo/signal-tracker-shared";

import { EntryCitationIndicator } from "./EntryCitationIndicator";

const apiMocks = vi.hoisted(() => ({
  useAttachEntryCitationMutation: vi.fn(),
  useCaptureEvidenceUrlMutation: vi.fn(),
  useDetachEntryCitationMutation: vi.fn(),
  useListEntryCitationsQuery: vi.fn(),
  useListEvidenceItemsQuery: vi.fn()
}));

vi.mock("@/api", () => ({
  useAttachEntryCitationMutation: apiMocks.useAttachEntryCitationMutation,
  useCaptureEvidenceUrlMutation: apiMocks.useCaptureEvidenceUrlMutation,
  useDetachEntryCitationMutation: apiMocks.useDetachEntryCitationMutation,
  useListEntryCitationsQuery: apiMocks.useListEntryCitationsQuery,
  useListEvidenceItemsQuery: apiMocks.useListEvidenceItemsQuery
}));

const evidenceRecord = {
  source: {
    id: "source-1",
    canonicalName: "Agency",
    baseUrl: "https://agency.example",
    sourceType: "government",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  evidenceItem: {
    id: "evidence-1",
    sourceId: "source-1",
    canonicalUrl: "https://agency.example/report",
    title: "Agency report",
    capturedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    metadata: {}
  }
} as const satisfies EvidenceRecord;

const secondEvidenceRecord = {
  source: {
    id: "source-2",
    canonicalName: "Reuters",
    baseUrl: "https://www.reuters.com",
    sourceType: "news",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  evidenceItem: {
    id: "evidence-2",
    sourceId: "source-2",
    canonicalUrl: "https://www.reuters.com/world/example",
    title: "Reuters source",
    capturedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    metadata: {}
  }
} as const satisfies EvidenceRecord;

const sparseEvidenceRecord = {
  source: {
    id: "source-3",
    canonicalName: "Sparse Source",
    sourceType: "other",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  evidenceItem: {
    id: "evidence-3",
    sourceId: "source-3",
    title: "Sparse evidence",
    capturedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    metadata: {}
  }
} as const satisfies EvidenceRecord;

const citationRecord = createCitationRecord({
  evidence: evidenceRecord,
  id: "citation-1",
  note: "Primary report.",
  quoteText: "Important source text",
  relationType: "source_for"
});
const sourceSummary = createSourceSummary(citationRecord);

describe("EntryCitationIndicator", () => {
  const attachEntryCitation = vi.fn();
  const captureEvidenceUrl = vi.fn();
  const detachEntryCitation = vi.fn();
  const unwrapAttachEntryCitation = vi.fn();
  const unwrapCaptureEvidenceUrl = vi.fn();
  const unwrapDetachEntryCitation = vi.fn();

  beforeEach(() => {
    attachEntryCitation.mockReset();
    captureEvidenceUrl.mockReset();
    detachEntryCitation.mockReset();
    unwrapAttachEntryCitation.mockReset();
    unwrapCaptureEvidenceUrl.mockReset();
    unwrapDetachEntryCitation.mockReset();
    apiMocks.useAttachEntryCitationMutation.mockReset();
    apiMocks.useCaptureEvidenceUrlMutation.mockReset();
    apiMocks.useDetachEntryCitationMutation.mockReset();
    apiMocks.useListEntryCitationsQuery.mockReset();
    apiMocks.useListEvidenceItemsQuery.mockReset();

    mockListEntryCitationsQuery({ citations: [] });
    mockListEvidenceItemsQuery({
      evidence: [evidenceRecord, secondEvidenceRecord]
    });
    mockAttachEntryCitationMutation();
    mockCaptureEvidenceUrlMutation();
    mockDetachEntryCitationMutation();
  });

  it("renders an uncited row state", () => {
    render(<EntryCitationIndicator entryId="entry-1" sources={[]} />);

    expect(
      screen.getByRole("button", { name: "No citation sources attached" })
    ).toBeInTheDocument();
    expect(screen.getByText("Uncited")).toBeInTheDocument();
  });

  it("renders citation loading state", () => {
    mockListEntryCitationsQuery({ isLoading: true });

    render(<EntryCitationIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No citation sources attached" })
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading citations");
  });

  it("renders citation load errors with retry inside the popover", () => {
    const refetch = vi.fn();
    mockListEntryCitationsQuery({
      errorMessage: "Citation lookup failed.",
      isError: true,
      refetch
    });

    render(<EntryCitationIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No citation sources attached" })
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Citation lookup failed."
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry citations" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders one citation source indicator", () => {
    mockListEntryCitationsQuery({ citations: [citationRecord] });

    const { container } = render(
      <EntryCitationIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    expect(
      screen.getByRole("button", { name: "1 citation source attached" })
    ).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://www.google.com/s2/favicons?domain=agency.example&sz=32"
    );
  });

  it("renders a compact stack for multiple citations", () => {
    const citations = [
      citationRecord,
      createCitationRecord({
        evidence: secondEvidenceRecord,
        id: "citation-2"
      }),
      createCitationRecord({
        evidence: sparseEvidenceRecord,
        id: "citation-3"
      }),
      createCitationRecord({
        evidence: {
          ...secondEvidenceRecord,
          evidenceItem: {
            ...secondEvidenceRecord.evidenceItem,
            id: "evidence-4",
            title: "Second Reuters source"
          }
        },
        id: "citation-4"
      })
    ];
    mockListEntryCitationsQuery({ citations });

    render(
      <EntryCitationIndicator
        entryId="entry-1"
        sources={citations.map(createSourceSummary)}
      />
    );

    expect(
      screen.getByRole("button", { name: "4 citation sources attached" })
    ).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders a fallback source icon when favicon display is unavailable", () => {
    const sparseCitation = createCitationRecord({
      evidence: sparseEvidenceRecord,
      id: "citation-3"
    });
    mockListEntryCitationsQuery({ citations: [sparseCitation] });

    const { container } = render(
      <EntryCitationIndicator
        entryId="entry-1"
        sources={[createSourceSummary(sparseCitation)]}
      />
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows citation details in the source popover", () => {
    mockListEntryCitationsQuery({ citations: [citationRecord] });

    render(
      <EntryCitationIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "1 citation source attached" })
    );

    const sourceRegion = screen.getByRole("region", {
      name: "Attached sources"
    });

    expect(within(sourceRegion).getByText("Agency report")).toBeInTheDocument();
    expect(
      within(sourceRegion).getByText("Agency / agency.example")
    ).toBeInTheDocument();
    expect(
      within(sourceRegion).getByText("https://agency.example/report")
    ).toBeInTheDocument();
    expect(within(sourceRegion).getByText("Source for")).toBeInTheDocument();
    expect(
      within(sourceRegion).getByText("Primary report.")
    ).toBeInTheDocument();
    expect(
      within(sourceRegion).getByText("Important source text")
    ).toBeInTheDocument();
  });

  it("attaches existing saved evidence with the default relation", async () => {
    render(<EntryCitationIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No citation sources attached" })
    );
    fireEvent.change(screen.getByLabelText("Saved evidence"), {
      target: { value: "evidence-1" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Attach evidence" }));

    await waitFor(() => {
      expect(attachEntryCitation).toHaveBeenCalledWith({
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        relationType: "supports",
        note: undefined
      });
    });
  });

  it("attaches captured URL evidence after capture succeeds", async () => {
    unwrapCaptureEvidenceUrl.mockResolvedValueOnce(evidenceRecord);
    render(<EntryCitationIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No citation sources attached" })
    );
    fireEvent.change(screen.getByLabelText("Add source URL"), {
      target: { value: "https://agency.example/report" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add source URL" }));

    await waitFor(() => {
      expect(captureEvidenceUrl).toHaveBeenCalledWith({
        url: "https://agency.example/report"
      });
      expect(attachEntryCitation).toHaveBeenCalledWith({
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        relationType: "supports",
        note: undefined
      });
    });
  });

  it("renders attach failures inline", async () => {
    unwrapAttachEntryCitation.mockRejectedValueOnce(
      createApiError("Citation could not be attached.")
    );
    render(<EntryCitationIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No citation sources attached" })
    );
    fireEvent.change(screen.getByLabelText("Saved evidence"), {
      target: { value: "evidence-1" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Attach evidence" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Citation could not be attached."
    );
  });

  it("detaches citation records and shows pending state", async () => {
    let resolveDetach: (value: DetachEntryCitationResponse) => void = () =>
      undefined;
    unwrapDetachEntryCitation.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDetach = resolve;
      })
    );
    mockListEntryCitationsQuery({ citations: [citationRecord] });
    render(
      <EntryCitationIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "1 citation source attached" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Detach source Agency" })
    );

    expect(detachEntryCitation).toHaveBeenCalledWith({
      entryId: "entry-1",
      citationId: "citation-1"
    });
    expect(
      screen.getByRole("button", { name: "Detach source Agency" })
    ).toBeDisabled();
    expect(screen.getByText("Detaching...")).toBeInTheDocument();

    await act(async () => {
      resolveDetach({ citation: citationRecord });
    });
  });

  it("renders detach failures inline", async () => {
    unwrapDetachEntryCitation.mockRejectedValueOnce(
      createApiError("Citation could not be detached.")
    );
    mockListEntryCitationsQuery({ citations: [citationRecord] });
    render(
      <EntryCitationIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "1 citation source attached" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Detach source Agency" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Citation could not be detached."
    );
  });

  function mockAttachEntryCitationMutation() {
    unwrapAttachEntryCitation.mockResolvedValue({
      citation: citationRecord
    } satisfies AttachEntryCitationResponse);
    apiMocks.useAttachEntryCitationMutation.mockImplementation(
      function useMockAttachEntryCitationMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function attachEntryCitationTrigger(request: unknown) {
          attachEntryCitation(request);

          return {
            async unwrap() {
              try {
                return (await unwrapAttachEntryCitation(
                  request
                )) as AttachEntryCitationResponse;
              } catch (error) {
                setErrorMessage(getMockApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [attachEntryCitationTrigger, { errorMessage, isLoading: false }];
      }
    );
  }

  function mockCaptureEvidenceUrlMutation() {
    unwrapCaptureEvidenceUrl.mockResolvedValue(evidenceRecord);
    apiMocks.useCaptureEvidenceUrlMutation.mockReturnValue([
      (request: unknown) => {
        captureEvidenceUrl(request);

        return {
          unwrap: () => unwrapCaptureEvidenceUrl(request)
        };
      },
      { errorMessage: undefined, isLoading: false }
    ]);
  }

  function mockDetachEntryCitationMutation() {
    unwrapDetachEntryCitation.mockResolvedValue({
      citation: citationRecord
    } satisfies DetachEntryCitationResponse);
    apiMocks.useDetachEntryCitationMutation.mockImplementation(
      function useMockDetachEntryCitationMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function detachEntryCitationTrigger(request: unknown) {
          detachEntryCitation(request);

          return {
            async unwrap() {
              try {
                return (await unwrapDetachEntryCitation(
                  request
                )) as DetachEntryCitationResponse;
              } catch (error) {
                setErrorMessage(getMockApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [detachEntryCitationTrigger, { errorMessage, isLoading: false }];
      }
    );
  }
});

function mockListEntryCitationsQuery({
  citations = [],
  errorMessage,
  isError = false,
  isLoading = false,
  refetch = vi.fn()
}: Partial<{
  citations: EntryCitationRecord[];
  errorMessage: string;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
}>) {
  apiMocks.useListEntryCitationsQuery.mockReturnValue({
    data: { citations } satisfies ListEntryCitationsResponse,
    errorMessage,
    isError,
    isLoading,
    refetch
  });
}

function mockListEvidenceItemsQuery(
  data: ListEvidenceItemsResponse,
  overrides: Partial<{
    errorMessage: string;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  }> = {}
) {
  apiMocks.useListEvidenceItemsQuery.mockReturnValue({
    data,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides
  });
}

function createCitationRecord({
  evidence,
  id,
  note,
  quoteText,
  relationType = "supports"
}: {
  evidence: EvidenceRecord;
  id: string;
  note?: string;
  quoteText?: string;
  relationType?: EntryCitationRecord["citation"]["relationType"];
}) {
  return {
    citation: {
      id,
      entryId: "entry-1",
      evidenceItemId: evidence.evidenceItem.id,
      evidenceAnchorId: quoteText ? `${id}-anchor` : undefined,
      relationType,
      note,
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    evidence,
    anchor: quoteText
      ? {
          id: `${id}-anchor`,
          evidenceItemId: evidence.evidenceItem.id,
          quoteText,
          locator: {},
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z"
        }
      : null
  } satisfies EntryCitationRecord;
}

function createSourceSummary(
  citationRecord: EntryCitationRecord
): AttachedSourceSummary {
  const url =
    citationRecord.evidence.evidenceItem.canonicalUrl ??
    citationRecord.evidence.source.baseUrl;
  const sourceDomain = url ? new URL(url).hostname : undefined;

  return {
    id: citationRecord.citation.id,
    evidenceItemId: citationRecord.citation.evidenceItemId,
    ...(url ? { url } : {}),
    ...(citationRecord.evidence.evidenceItem.canonicalUrl
      ? { canonicalUrl: citationRecord.evidence.evidenceItem.canonicalUrl }
      : {}),
    title: citationRecord.evidence.evidenceItem.title,
    sourceName: citationRecord.evidence.source.canonicalName,
    ...(sourceDomain ? { sourceDomain } : {}),
    relationType: citationRecord.citation.relationType
  };
}

function createApiError(message: string) {
  return {
    data: {
      error: {
        code: "REQUEST_FAILED",
        message
      }
    },
    status: 400
  };
}

function getMockApiErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "error" in error.data &&
    typeof error.data.error === "object" &&
    error.data.error !== null &&
    "message" in error.data.error &&
    typeof error.data.error.message === "string"
  ) {
    return error.data.error.message;
  }

  return "Request failed.";
}
