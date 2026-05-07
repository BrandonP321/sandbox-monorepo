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
  EvidenceRecord
} from "@repo/signal-tracker-shared";

import { EntrySourceIndicator } from "./EntrySourceIndicator";

const apiMocks = vi.hoisted(() => ({
  useAttachEntryCitationMutation: vi.fn(),
  useCaptureEvidenceUrlMutation: vi.fn(),
  useDetachEntryCitationMutation: vi.fn(),
  useListEvidenceItemsQuery: vi.fn()
}));

vi.mock("@/api", () => ({
  useAttachEntryCitationMutation: apiMocks.useAttachEntryCitationMutation,
  useCaptureEvidenceUrlMutation: apiMocks.useCaptureEvidenceUrlMutation,
  useDetachEntryCitationMutation: apiMocks.useDetachEntryCitationMutation,
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
    publishedAt: "2026-01-01T12:00:00.000Z",
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
  relationType: "source_for"
});
const sourceSummary = createSourceSummary(citationRecord);

describe("EntrySourceIndicator", () => {
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
    apiMocks.useListEvidenceItemsQuery.mockReset();

    mockAttachEntryCitationMutation();
    mockCaptureEvidenceUrlMutation();
    mockDetachEntryCitationMutation();
  });

  it("renders an uncited row state from hydrated sources", () => {
    render(<EntrySourceIndicator entryId="entry-1" sources={[]} />);

    expect(
      screen.getByRole("button", { name: "No sources attached" })
    ).toBeInTheDocument();
    expect(screen.getByText("Uncited")).toBeInTheDocument();
  });

  it("renders one source indicator from hydrated sources", () => {
    const { container } = render(
      <EntrySourceIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    expect(
      screen.getByRole("button", { name: "1 source attached" })
    ).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://www.google.com/s2/favicons?domain=agency.example&sz=32"
    );
  });

  it("renders a compact stack for multiple hydrated sources", () => {
    const sources = [
      sourceSummary,
      createSourceSummary(
        createCitationRecord({
          evidence: secondEvidenceRecord,
          id: "citation-2"
        })
      ),
      createSourceSummary(
        createCitationRecord({
          evidence: sparseEvidenceRecord,
          id: "citation-3"
        })
      ),
      createSourceSummary(
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
      )
    ];

    render(<EntrySourceIndicator entryId="entry-1" sources={sources} />);

    expect(
      screen.getByRole("button", { name: "4 sources attached" })
    ).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders a fallback source icon when favicon display is unavailable", () => {
    const sparseSource = createSourceSummary(
      createCitationRecord({
        evidence: sparseEvidenceRecord,
        id: "citation-3"
      })
    );

    const { container } = render(
      <EntrySourceIndicator entryId="entry-1" sources={[sparseSource]} />
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows hydrated source details in the source popover", () => {
    render(
      <EntrySourceIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "1 source attached" }));

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
    expect(within(sourceRegion).getByText("Jan 1, 2026")).toBeInTheDocument();
    expect(within(sourceRegion).getByText("Source for")).toBeInTheDocument();
  });

  it("does not expose saved-evidence selection in the default source path", () => {
    render(<EntrySourceIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No sources attached" })
    );

    expect(screen.getByLabelText("Add source URL")).toBeInTheDocument();
    expect(screen.queryByLabelText("Saved evidence")).not.toBeInTheDocument();
    expect(screen.queryByText("Choose saved evidence")).not.toBeInTheDocument();
    expect(screen.queryByText("Attach evidence")).not.toBeInTheDocument();
    expect(apiMocks.useListEvidenceItemsQuery).not.toHaveBeenCalled();
  });

  it("attaches captured URL evidence as a source after capture succeeds", async () => {
    unwrapCaptureEvidenceUrl.mockResolvedValueOnce(evidenceRecord);
    render(<EntrySourceIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No sources attached" })
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
        relationType: "source_for",
        note: undefined
      });
    });
  });

  it("renders attach failures inline", async () => {
    unwrapAttachEntryCitation.mockRejectedValueOnce(
      createApiError("Source could not be attached.")
    );
    render(<EntrySourceIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No sources attached" })
    );
    fireEvent.change(screen.getByLabelText("Add source URL"), {
      target: { value: "https://agency.example/report" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add source URL" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Source could not be attached."
    );
  });

  it("removes attached sources and shows pending state", async () => {
    let resolveDetach: (value: DetachEntryCitationResponse) => void = () =>
      undefined;
    unwrapDetachEntryCitation.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDetach = resolve;
      })
    );
    render(
      <EntrySourceIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "1 source attached" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Remove source Agency report" })
    );

    expect(detachEntryCitation).toHaveBeenCalledWith({
      entryId: "entry-1",
      citationId: "citation-1"
    });
    expect(
      screen.getByRole("button", { name: "Remove source Agency report" })
    ).toBeDisabled();
    expect(screen.getByText("Removing...")).toBeInTheDocument();

    await act(async () => {
      resolveDetach({ citation: citationRecord });
    });
  });

  it("renders remove failures inline", async () => {
    unwrapDetachEntryCitation.mockRejectedValueOnce(
      createApiError("Source could not be removed.")
    );
    render(
      <EntrySourceIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "1 source attached" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Remove source Agency report" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Source could not be removed."
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

function createCitationRecord({
  evidence,
  id,
  relationType = "supports"
}: {
  evidence: EvidenceRecord;
  id: string;
  relationType?: EntryCitationRecord["citation"]["relationType"];
}) {
  return {
    citation: {
      id,
      entryId: "entry-1",
      evidenceItemId: evidence.evidenceItem.id,
      relationType,
      note: undefined,
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    evidence,
    anchor: null
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
    ...(citationRecord.evidence.evidenceItem.publishedAt
      ? { publishedAt: citationRecord.evidence.evidenceItem.publishedAt }
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
