import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  AttachedSourceSummary,
  Entry,
  EntryCitationRecord,
  EvidenceRecord,
  ReplaceEntrySourcesResponse
} from "@repo/signal-tracker-shared";

import { useNotifications } from "@/components/ui";

import { EntrySourceIndicator } from "./EntrySourceIndicator";

const apiMocks = vi.hoisted(() => ({
  useReplaceEntrySourcesMutation: vi.fn()
}));

vi.mock("@/api", () => ({
  useReplaceEntrySourcesMutation: apiMocks.useReplaceEntrySourcesMutation
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

const entry = {
  id: "entry-1",
  topicId: "topic-1",
  kind: "event",
  epistemicStatus: "reported",
  title: "Court grants injunction",
  bodyMd: "A federal court granted an injunction.",
  sortAt: "2026-01-01T00:00:00.000Z",
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
} as const satisfies Entry;

describe("EntrySourceIndicator", () => {
  const replaceEntrySources = vi.fn();
  const unwrapReplaceEntrySources = vi.fn();

  beforeEach(() => {
    replaceEntrySources.mockReset();
    unwrapReplaceEntrySources.mockReset();
    apiMocks.useReplaceEntrySourcesMutation.mockReset();

    mockReplaceEntrySourcesMutation();
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
          evidence: {
            source: {
              ...secondEvidenceRecord.source,
              id: "source-3",
              baseUrl: "https://analysis.example",
              canonicalName: "Analysis"
            },
            evidenceItem: {
              ...secondEvidenceRecord.evidenceItem,
              id: "evidence-3",
              sourceId: "source-3",
              canonicalUrl: "https://analysis.example/report",
              title: "Analysis source"
            }
          },
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

  it("does not count source citations without URL metadata as source URL attachments", () => {
    const sparseSource = createSourceSummary(
      createCitationRecord({
        evidence: sparseEvidenceRecord,
        id: "citation-3"
      })
    );

    const { container } = render(
      <EntrySourceIndicator entryId="entry-1" sources={[sparseSource]} />
    );

    expect(
      screen.getByRole("button", { name: "No sources attached" })
    ).toBeInTheDocument();
    expect(screen.getByText("Uncited")).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("does not count non-source citations as source URL attachments", async () => {
    const supportingSource = createSourceSummary(
      createCitationRecord({
        evidence: secondEvidenceRecord,
        id: "citation-supporting",
        relationType: "supports"
      })
    );

    render(
      <EntrySourceIndicator entryId="entry-1" sources={[supportingSource]} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "No sources attached" })
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Manage sources"
    });

    expect(
      within(dialog).queryByLabelText("Source URL 1")
    ).not.toBeInTheDocument();
  });

  it("opens a dialog with existing source URL rows", async () => {
    render(
      <EntrySourceIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "1 source attached" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Manage sources"
    });

    expect(within(dialog).getByLabelText("Source URL 1")).toHaveValue(
      "https://agency.example/report"
    );
    expect(
      within(dialog).getByLabelText("Source preview for agency.example")
    ).toBeInTheDocument();
  });

  it("does not expose saved-evidence selection in the default source path", async () => {
    render(<EntrySourceIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No sources attached" })
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Manage sources"
    });

    expect(
      within(dialog).getByRole("button", { name: "Add source" })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Saved evidence")).not.toBeInTheDocument();
    expect(screen.queryByText("Choose saved evidence")).not.toBeInTheDocument();
    expect(screen.queryByText("Attach evidence")).not.toBeInTheDocument();
  });

  it("replaces source URLs after a URL is added", async () => {
    render(<EntrySourceIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No sources attached" })
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Manage sources"
    });
    addSourceUrl(dialog, "https://agency.example/report");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save sources" })
    );

    await waitFor(() => {
      expect(replaceEntrySources).toHaveBeenCalledWith({
        entryId: "entry-1",
        sources: [{ url: "https://agency.example/report" }]
      });
    });
  });

  it("renders save failures inline", async () => {
    unwrapReplaceEntrySources.mockRejectedValueOnce(
      createApiError("Sources could not be saved.")
    );
    render(<EntrySourceIndicator entryId="entry-1" sources={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "No sources attached" })
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Manage sources"
    });
    addSourceUrl(dialog, "https://agency.example/report");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save sources" })
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Sources could not be saved."
    );
  });

  it("removes attached sources and shows pending state", async () => {
    let resolveReplace: (value: ReplaceEntrySourcesResponse) => void = () =>
      undefined;
    unwrapReplaceEntrySources.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveReplace = resolve;
      })
    );
    render(
      <EntrySourceIndicator entryId="entry-1" sources={[sourceSummary]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "1 source attached" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Manage sources"
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove" }));
    const saveButton = within(dialog).getByRole("button", {
      name: "Save sources"
    });

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(replaceEntrySources).toHaveBeenCalledWith({
        entryId: "entry-1",
        sources: []
      });
    });
    expect(
      await within(dialog).findByRole("button", { name: "Saving sources..." })
    ).toBeDisabled();

    await act(async () => {
      resolveReplace({ entry });
    });
  });

  function mockReplaceEntrySourcesMutation() {
    unwrapReplaceEntrySources.mockResolvedValue({
      entry
    } satisfies ReplaceEntrySourcesResponse);
    apiMocks.useReplaceEntrySourcesMutation.mockImplementation(
      function useMockReplaceEntrySourcesMutation() {
        const { notifyError } = useNotifications();

        function replaceEntrySourcesTrigger(request: unknown) {
          replaceEntrySources(request);

          return {
            async unwrap() {
              try {
                return (await unwrapReplaceEntrySources(
                  request
                )) as ReplaceEntrySourcesResponse;
              } catch (error) {
                notifyError({
                  content: getMockApiErrorMessage(error),
                  header: "Unable to save sources"
                });
                throw error;
              }
            }
          };
        }

        return [
          replaceEntrySourcesTrigger,
          { errorMessage: undefined, isLoading: false }
        ];
      }
    );
  }
});

function createCitationRecord({
  evidence,
  id,
  relationType = "source_for"
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

function addSourceUrl(dialog: HTMLElement, url: string) {
  const sourceCount =
    within(dialog).queryAllByLabelText(/Source URL \d+/u).length;

  fireEvent.click(within(dialog).getByRole("button", { name: "Add source" }));
  fireEvent.change(
    within(dialog).getByLabelText(`Source URL ${sourceCount + 1}`),
    {
      target: { value: url }
    }
  );
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
