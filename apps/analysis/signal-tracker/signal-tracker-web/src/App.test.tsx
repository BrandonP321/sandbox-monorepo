import type {
  AssessmentUpdate,
  ArchiveTopicResponse,
  CreateAssessmentUpdateResponse,
  CreateEventEntryResponse,
  CreateReviewNoteResponse,
  CreateTopicResponse,
  DeleteTopicResponse,
  Entry,
  GetTopicResponse,
  ListEventEntriesResponse,
  ListReviewNotesResponse,
  ListTopicsResponse,
  UpdateTopicResponse
} from "@repo/signal-tracker-shared";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";

import App from "./App";
import { createAssessmentUpdate } from "./api/assessments";
import { SignalTrackerApiError } from "./api/client";
import { createEventEntry, listEventEntries } from "./api/event-entries";
import { createReviewNote, listReviewNotes } from "./api/review-notes";
import {
  archiveTopic,
  createTopic,
  deleteTopic,
  getTopic,
  listTopics,
  updateTopic
} from "./api/topics";
import { fetchHealthStatus } from "./health";

vi.mock("./health", async () => {
  const actual = await vi.importActual<typeof import("./health")>("./health");

  return {
    ...actual,
    fetchHealthStatus: vi.fn()
  };
});

vi.mock("./api/topics", async () => {
  const actual =
    await vi.importActual<typeof import("./api/topics")>("./api/topics");

  return {
    ...actual,
    archiveTopic: vi.fn(),
    createTopic: vi.fn(),
    deleteTopic: vi.fn(),
    getTopic: vi.fn(),
    listTopics: vi.fn(),
    updateTopic: vi.fn()
  };
});

vi.mock("./api/event-entries", async () => {
  const actual = await vi.importActual<typeof import("./api/event-entries")>(
    "./api/event-entries"
  );

  return {
    ...actual,
    createEventEntry: vi.fn(),
    listEventEntries: vi.fn()
  };
});

vi.mock("./api/review-notes", async () => {
  const actual =
    await vi.importActual<typeof import("./api/review-notes")>(
      "./api/review-notes"
    );

  return {
    ...actual,
    createReviewNote: vi.fn(),
    listReviewNotes: vi.fn()
  };
});

vi.mock("./api/assessments", async () => {
  const actual =
    await vi.importActual<typeof import("./api/assessments")>(
      "./api/assessments"
    );

  return {
    ...actual,
    createAssessmentUpdate: vi.fn()
  };
});

const topicFixture = {
  id: "topic-1",
  title: "Iran strike risk",
  framingQuestion: "Will tensions escalate?",
  scopeNote: "Track official signals and credible reporting.",
  status: "active" as const,
  reviewCadence: "weekly" as const,
  createdAt: "2026-04-26T00:00:00.000Z",
  updatedAt: "2026-04-27T00:00:00.000Z"
};

const createdTopicResponse: CreateTopicResponse = {
  topic: topicFixture
};

const getTopicResponse: GetTopicResponse = {
  topic: topicFixture,
  currentAssessment: null
};

const updatedTopicFixture = {
  ...topicFixture,
  title: "Iran escalation risk",
  framingQuestion: "Will direct conflict escalate?",
  scopeNote: undefined,
  reviewCadence: "monthly" as const,
  updatedAt: "2026-04-29T00:00:00.000Z"
};

const updatedTopicResponse: UpdateTopicResponse = {
  topic: updatedTopicFixture
};

const archivedTopicFixture = {
  ...topicFixture,
  status: "archived" as const,
  archivedAt: "2026-04-30T00:00:00.000Z",
  updatedAt: "2026-04-30T00:00:00.000Z"
};

const archivedTopicResponse: ArchiveTopicResponse = {
  topic: archivedTopicFixture
};

const deletedTopicResponse: DeleteTopicResponse = {
  topic: topicFixture
};

const newerTopicFixture = {
  id: "topic-2",
  title: "AI copyright litigation",
  framingQuestion: "What legal risk is emerging?",
  scopeNote: undefined,
  status: "active" as const,
  reviewCadence: "ad_hoc" as const,
  createdAt: "2026-04-27T00:00:00.000Z",
  updatedAt: "2026-04-28T00:00:00.000Z"
};

const listTopicsResponse: ListTopicsResponse = {
  topics: [newerTopicFixture, topicFixture]
};

const eventEntryFixture: Entry = {
  id: "entry-1",
  topicId: "topic-1",
  kind: "event",
  epistemicStatus: "reported",
  title: "Court grants injunction",
  bodyMd: "A federal court granted an injunction.",
  sortAt: "2026-04-25T00:00:00.000Z",
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: "2026-04-25T01:00:00.000Z",
  updatedAt: "2026-04-25T01:00:00.000Z"
};

const eventEntryResponse: CreateEventEntryResponse = {
  entry: eventEntryFixture
};

const listEventEntriesResponse: ListEventEntriesResponse = {
  entries: []
};

const reviewNoteFixture: Entry = {
  id: "review-1",
  topicId: "topic-1",
  kind: "review",
  epistemicStatus: "inferred",
  title: "Weekly review",
  bodyMd: "Reviewed recent developments and found no material change.",
  sortAt: "2026-04-26T00:00:00.000Z",
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: "2026-04-26T01:00:00.000Z",
  updatedAt: "2026-04-26T01:00:00.000Z"
};

const reviewNoteResponse: CreateReviewNoteResponse = {
  entry: reviewNoteFixture
};

const listReviewNotesResponse: ListReviewNotesResponse = {
  entries: []
};

const assessmentUpdateFixture: AssessmentUpdate = {
  entry: {
    id: "assessment-1",
    topicId: "topic-1",
    kind: "assessment",
    epistemicStatus: "forecast",
    title: "Assessment update - 2026-04-25",
    bodyMd: "Escalation risk remains limited.",
    sortAt: "2026-04-25T00:00:00.000Z",
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: "2026-04-25T01:00:00.000Z",
    updatedAt: "2026-04-25T01:00:00.000Z"
  },
  judgment: "Escalation risk remains limited.",
  confidenceLabel: "medium",
  probabilityPct: 35,
  assumptions: ["Diplomatic channels remain open"],
  indicators: ["Watch for evacuation orders"],
  resolutionCriteria: "Direct military action occurs.",
  targetResolvesAt: "2026-05-25T00:00:00.000Z",
  previousAssessmentEntryId: undefined
};

const assessmentUpdateResponse: CreateAssessmentUpdateResponse = {
  assessmentUpdate: assessmentUpdateFixture
};

afterEach(() => {
  vi.clearAllMocks();
});

const fetchHealthStatusMock = vi.mocked(fetchHealthStatus);
const createTopicMock = vi.mocked(createTopic);
const getTopicMock = vi.mocked(getTopic);
const listTopicsMock = vi.mocked(listTopics);
const updateTopicMock = vi.mocked(updateTopic);
const archiveTopicMock = vi.mocked(archiveTopic);
const deleteTopicMock = vi.mocked(deleteTopic);
const createEventEntryMock = vi.mocked(createEventEntry);
const listEventEntriesMock = vi.mocked(listEventEntries);
const createReviewNoteMock = vi.mocked(createReviewNote);
const listReviewNotesMock = vi.mocked(listReviewNotes);
const createAssessmentUpdateMock = vi.mocked(createAssessmentUpdate);

describe("App", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    fetchHealthStatusMock.mockResolvedValue({ ok: true });
    createTopicMock.mockResolvedValue(createdTopicResponse);
    getTopicMock.mockResolvedValue(getTopicResponse);
    listTopicsMock.mockResolvedValue(listTopicsResponse);
    updateTopicMock.mockResolvedValue(updatedTopicResponse);
    archiveTopicMock.mockResolvedValue(archivedTopicResponse);
    deleteTopicMock.mockResolvedValue(deletedTopicResponse);
    createEventEntryMock.mockResolvedValue(eventEntryResponse);
    listEventEntriesMock.mockResolvedValue(listEventEntriesResponse);
    createReviewNoteMock.mockResolvedValue(reviewNoteResponse);
    listReviewNotesMock.mockResolvedValue(listReviewNotesResponse);
    createAssessmentUpdateMock.mockResolvedValue(assessmentUpdateResponse);
  });

  it("renders the loading state while the health check is in flight", () => {
    fetchHealthStatusMock.mockReturnValue(new Promise(() => undefined));
    listTopicsMock.mockReturnValue(new Promise(() => undefined));

    render(<App />);

    expect(screen.getByText("Signal Tracker")).toBeInTheDocument();
    expect(
      screen.getByText("Checking the API scaffold...")
    ).toBeInTheDocument();
  });

  it("renders the healthy backend state", async () => {
    render(<App />);

    expect(
      await screen.findByText("API scaffold ready: healthy.")
    ).toBeInTheDocument();
  });

  it("renders the root topic list and loads active topic dossiers", async () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Active topic dossiers" })
    ).toBeInTheDocument();
    expect(listTopicsMock).toHaveBeenCalledWith(
      { query: undefined },
      expect.objectContaining({ onProgress: expect.any(Function) })
    );
    expect(
      await screen.findByRole("link", { name: "AI copyright litigation" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Iran strike risk" })
    ).toHaveAttribute("href", "/topics/topic-1");
    expect(
      screen.getByText("What legal risk is emerging?")
    ).toBeInTheDocument();
    expect(screen.getByText("Will tensions escalate?")).toBeInTheDocument();
    expect(screen.getByText("Ad hoc")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Apr 28, 2026")).toBeInTheDocument();
    expect(screen.getByText("Apr 27, 2026")).toBeInTheDocument();
  });

  it("opens a topic detail from the root topic list", async () => {
    render(<App />);

    fireEvent.click(
      await screen.findByRole("link", { name: "Iran strike risk" })
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe("/topics/topic-1");
    });
    expect(getTopicMock).toHaveBeenCalledWith(
      { topicId: "topic-1" },
      expect.objectContaining({ onProgress: expect.any(Function) })
    );
    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();
  });

  it("renders an empty topic list with a topic creation affordance", async () => {
    listTopicsMock.mockResolvedValue({ topics: [] });

    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "Create your first topic dossier"
      })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create a topic" }));

    expect(window.location.pathname).toBe("/topics/new");
    expect(
      screen.getByRole("heading", { name: "Create a topic dossier" })
    ).toBeInTheDocument();
  });

  it("shows a topic list request error with a retry affordance", async () => {
    listTopicsMock
      .mockRejectedValueOnce(new Error("database unavailable"))
      .mockResolvedValueOnce(listTopicsResponse);

    render(<App />);

    expect(
      await screen.findByText(
        "The database-backed request could not be completed."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("link", { name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(listTopicsMock).toHaveBeenCalledTimes(2);
  });

  it("shows the shared wake-up status when list-topics reports waking progress", async () => {
    listTopicsMock.mockImplementation(
      async (_request, options) =>
        new Promise<ListTopicsResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
  });

  it("renders the topic creation route without placeholder module copy", async () => {
    window.history.pushState({}, "", "/topics/new");

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Create a topic dossier" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Framing question")).toBeInTheDocument();
    expect(screen.getByLabelText("Scope note")).toBeInTheDocument();
    expect(screen.getByLabelText("Review cadence")).toHaveValue("ad_hoc");
    expect(screen.queryByText(/source ingestion/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/scoring/i)).not.toBeInTheDocument();
    expect(
      await screen.findByText("API scaffold ready: healthy.")
    ).toBeInTheDocument();
  });

  it("shows required-field errors before calling the API", async () => {
    window.history.pushState({}, "", "/topics/new");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Create topic" }));

    expect(await screen.findByText("Enter a topic title.")).toBeInTheDocument();
    expect(screen.getByText("Enter a framing question.")).toBeInTheDocument();
    expect(createTopicMock).not.toHaveBeenCalled();
  });

  it("submits a parsed topic request and navigates to the durable topic route", async () => {
    window.history.pushState({}, "", "/topics/new");

    render(<App />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "  Iran strike risk  " }
    });
    fireEvent.change(screen.getByLabelText("Framing question"), {
      target: { value: " Will tensions escalate? " }
    });
    fireEvent.change(screen.getByLabelText("Scope note"), {
      target: { value: " Track official signals and credible reporting. " }
    });
    fireEvent.change(screen.getByLabelText("Review cadence"), {
      target: { value: "weekly" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create topic" }));

    await waitFor(() => {
      expect(createTopicMock).toHaveBeenCalledWith(
        {
          title: "Iran strike risk",
          framingQuestion: "Will tensions escalate?",
          scopeNote: "Track official signals and credible reporting.",
          reviewCadence: "weekly"
        },
        expect.objectContaining({
          onProgress: expect.any(Function)
        })
      );
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/topics/topic-1");
    });
    expect(getTopicMock).toHaveBeenCalledWith(
      { topicId: "topic-1" },
      expect.objectContaining({ onProgress: expect.any(Function) })
    );
    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();
  });

  it("omits a blank scope note through the shared schema", async () => {
    window.history.pushState({}, "", "/topics/new");

    render(<App />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "AI copyright litigation" }
    });
    fireEvent.change(screen.getByLabelText("Framing question"), {
      target: { value: "What legal risk is emerging?" }
    });
    fireEvent.change(screen.getByLabelText("Scope note"), {
      target: { value: "   " }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create topic" }));

    await waitFor(() => {
      expect(createTopicMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "AI copyright litigation",
          framingQuestion: "What legal risk is emerging?",
          scopeNote: undefined,
          reviewCadence: "ad_hoc"
        }),
        expect.any(Object)
      );
    });
  });

  it("loads a topic detail route by ID and renders core dossier metadata", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(getTopicMock).toHaveBeenCalledWith(
      { topicId: "topic-1" },
      expect.objectContaining({ onProgress: expect.any(Function) })
    );
    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(screen.getByText("Will tensions escalate?")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Apr 26, 2026")).toBeInTheDocument();
    expect(screen.getByText("Apr 27, 2026")).toBeInTheDocument();
    expect(
      screen.getByText("Track official signals and credible reporting.")
    ).toBeInTheDocument();
  });

  it("omits the optional scope note on the topic detail route when absent", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    getTopicMock.mockResolvedValue({
      topic: {
        ...topicFixture,
        scopeNote: undefined
      },
      currentAssessment: null
    });

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Scope note")).not.toBeInTheDocument();
  });

  it("edits topic metadata from the detail route and refreshes the rendered topic", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit topic" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "  Iran escalation risk  " }
    });
    fireEvent.change(screen.getByLabelText("Framing question"), {
      target: { value: " Will direct conflict escalate? " }
    });
    fireEvent.change(screen.getByLabelText("Scope note"), {
      target: { value: "   " }
    });
    fireEvent.change(screen.getByLabelText("Review cadence"), {
      target: { value: "monthly" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateTopicMock).toHaveBeenCalledWith(
        {
          topicId: "topic-1",
          title: "Iran escalation risk",
          framingQuestion: "Will direct conflict escalate?",
          scopeNote: null,
          reviewCadence: "monthly"
        },
        expect.objectContaining({ onProgress: expect.any(Function) })
      );
    });

    expect(
      await screen.findByRole("heading", { name: "Iran escalation risk" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Will direct conflict escalate?")
    ).toBeInTheDocument();
    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.queryByText("Scope note")).not.toBeInTheDocument();
  });

  it("shows edit validation errors before calling the update API", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit topic" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: " " }
    });
    fireEvent.change(screen.getByLabelText("Framing question"), {
      target: { value: " " }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Enter a topic title.")).toBeInTheDocument();
    expect(screen.getByText("Enter a framing question.")).toBeInTheDocument();
    expect(updateTopicMock).not.toHaveBeenCalled();
  });

  it("shows an update request error with retry state", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    updateTopicMock
      .mockRejectedValueOnce(new Error("database unavailable"))
      .mockResolvedValueOnce(updatedTopicResponse);

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit topic" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Iran escalation risk" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText(
        "The database-backed request could not be completed."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(updateTopicMock).toHaveBeenCalledTimes(2);
    });
    expect(
      await screen.findByRole("heading", { name: "Iran escalation risk" })
    ).toBeInTheDocument();
  });

  it("archives a topic from the detail route and keeps the direct route readable", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Archive topic" }));
    expect(
      screen.getByText(/preserving the dossier record/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm archive" }));

    await waitFor(() => {
      expect(archiveTopicMock).toHaveBeenCalledWith(
        { topicId: "topic-1" },
        expect.objectContaining({ onProgress: expect.any(Function) })
      );
    });
    expect(await screen.findByText("Archived")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/topics/topic-1");
  });

  it("shows wake-up progress while archiving a topic", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    archiveTopicMock.mockImplementation(
      async (_request, options) =>
        new Promise<ArchiveTopicResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Archive topic" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm archive" }));

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archiving..." })).toBeDisabled();
  });

  it("archives a topic from the list and removes it from active topics", async () => {
    render(<App />);

    const topicLink = await screen.findByRole("link", {
      name: "Iran strike risk"
    });
    const topicCard = topicLink.closest("article");

    expect(topicCard).not.toBeNull();
    fireEvent.click(
      within(topicCard!).getByRole("button", { name: "Archive" })
    );
    fireEvent.click(
      within(topicCard!).getByRole("button", { name: "Confirm archive" })
    );

    await waitFor(() => {
      expect(archiveTopicMock).toHaveBeenCalledWith(
        { topicId: "topic-1" },
        expect.objectContaining({ onProgress: expect.any(Function) })
      );
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("link", { name: "Iran strike risk" })
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: "AI copyright litigation" })
    ).toBeInTheDocument();
  });

  it("renders the empty list state after archiving the last active topic", async () => {
    listTopicsMock.mockResolvedValue({ topics: [topicFixture] });

    render(<App />);

    const topicLink = await screen.findByRole("link", {
      name: "Iran strike risk"
    });
    const topicCard = topicLink.closest("article");

    expect(topicCard).not.toBeNull();
    fireEvent.click(
      within(topicCard!).getByRole("button", { name: "Archive" })
    );
    fireEvent.click(
      within(topicCard!).getByRole("button", { name: "Confirm archive" })
    );

    expect(
      await screen.findByRole("heading", {
        name: "Create your first topic dossier"
      })
    ).toBeInTheDocument();
  });

  it("keeps delete off list cards and exposes detail-only hard delete confirmation", async () => {
    render(<App />);

    expect(
      await screen.findByRole("link", { name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete topic" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Iran strike risk" }));
    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/current API permanently removes the topic row/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/soft delete/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete topic" }));

    const deleteButton = screen.getByRole("button", {
      name: "Permanently delete topic"
    });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(
      screen.getByLabelText("Type Iran strike risk to confirm"),
      {
        target: { value: "wrong title" }
      }
    );
    expect(deleteButton).toBeDisabled();

    fireEvent.change(
      screen.getByLabelText("Type Iran strike risk to confirm"),
      {
        target: { value: "Iran strike risk" }
      }
    );
    expect(deleteButton).toBeEnabled();
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteTopicMock).toHaveBeenCalledWith(
        { topicId: "topic-1" },
        expect.objectContaining({ onProgress: expect.any(Function) })
      );
    });
    expect(window.location.pathname).toBe("/");
  });

  it("renders the event section with an empty state on the topic detail route", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Topic events" })
    ).toBeInTheDocument();
    expect(listEventEntriesMock).toHaveBeenCalledWith(
      { topicId: "topic-1" },
      expect.objectContaining({ onProgress: expect.any(Function) })
    );
    expect(
      await screen.findByText(
        /No events yet. Add dated developments here when something happens/
      )
    ).toBeInTheDocument();
  });

  it("renders persisted event entries with epistemic and uncited state", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    listEventEntriesMock.mockResolvedValue({
      entries: [eventEntryFixture]
    });

    render(<App />);

    const eventSection = (
      await screen.findByRole("heading", {
        name: "Topic events"
      })
    ).closest("section");

    expect(eventSection).not.toBeNull();
    expect(
      await screen.findByRole("heading", {
        name: "Court grants injunction"
      })
    ).toBeInTheDocument();
    expect(within(eventSection!).getByText("Reported")).toBeInTheDocument();
    expect(within(eventSection!).getByText("Uncited")).toBeInTheDocument();
    expect(within(eventSection!).getByText("Apr 25, 2026")).toBeInTheDocument();
  });

  it("opens and cancels the collapsible event form", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Topic events" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add event" }));

    expect(
      screen.getByRole("form", { name: "Add event entry" })
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Event title"), {
      target: { value: "Draft event" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("form", { name: "Add event entry" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add event" }));
    expect(screen.getByLabelText("Event title")).toHaveValue("");
  });

  it("shows event form validation errors before calling the create API", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Topic events" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add event" }));
    fireEvent.click(screen.getByRole("button", { name: "Save event" }));

    expect(
      await screen.findByText("Enter an event title.")
    ).toBeInTheDocument();
    expect(screen.getByText("Enter an event description.")).toBeInTheDocument();
    expect(screen.getByText("Choose an event date.")).toBeInTheDocument();
    expect(createEventEntryMock).not.toHaveBeenCalled();
  });

  it("creates an event entry and renders it in the topic event section", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Topic events" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add event" }));
    fireEvent.change(screen.getByLabelText("Event title"), {
      target: { value: " Court grants injunction " }
    });
    fireEvent.change(screen.getByLabelText("Event description"), {
      target: { value: " A federal court granted an injunction. " }
    });
    fireEvent.change(screen.getByLabelText("Event date"), {
      target: { value: "2026-04-25" }
    });
    fireEvent.change(screen.getByLabelText("Epistemic label"), {
      target: { value: "reported" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save event" }));

    await waitFor(() => {
      expect(createEventEntryMock).toHaveBeenCalledWith(
        {
          topicId: "topic-1",
          title: "Court grants injunction",
          bodyMd: "A federal court granted an injunction.",
          sortAt: "2026-04-25T00:00:00.000Z",
          epistemicStatus: "reported"
        },
        expect.objectContaining({ onProgress: expect.any(Function) })
      );
    });
    expect(await screen.findByText("Event saved.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Court grants injunction" })
    ).toBeInTheDocument();
  });

  it("shows an event create request error without clearing entered text", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    createEventEntryMock.mockRejectedValueOnce(
      new Error("database unavailable")
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Topic events" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add event" }));
    fireEvent.change(screen.getByLabelText("Event title"), {
      target: { value: "Court grants injunction" }
    });
    fireEvent.change(screen.getByLabelText("Event description"), {
      target: { value: "A federal court granted an injunction." }
    });
    fireEvent.change(screen.getByLabelText("Event date"), {
      target: { value: "2026-04-25" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save event" }));

    expect(
      await screen.findByText(
        "The database-backed request could not be completed."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Event title")).toHaveValue(
      "Court grants injunction"
    );
    expect(screen.getByLabelText("Event description")).toHaveValue(
      "A federal court granted an injunction."
    );
    expect(screen.getByLabelText("Event date")).toHaveValue("2026-04-25");
  });

  it("shows wake-up progress while loading event entries", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    listEventEntriesMock.mockImplementation(
      async (_request, options) =>
        new Promise<ListEventEntriesResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
  });

  it("shows wake-up progress while creating an event entry", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    createEventEntryMock.mockImplementation(
      async (_request, options) =>
        new Promise<CreateEventEntryResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Topic events" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add event" }));
    fireEvent.change(screen.getByLabelText("Event title"), {
      target: { value: "Court grants injunction" }
    });
    fireEvent.change(screen.getByLabelText("Event description"), {
      target: { value: "A federal court granted an injunction." }
    });
    fireEvent.change(screen.getByLabelText("Event date"), {
      target: { value: "2026-04-25" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save event" }));

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saving event..." })
    ).toBeDisabled();
  });

  it("renders the review notes section with an empty state on the topic detail route", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Review notes" })
    ).toBeInTheDocument();
    expect(listReviewNotesMock).toHaveBeenCalledWith(
      { topicId: "topic-1" },
      expect.objectContaining({ onProgress: expect.any(Function) })
    );
    expect(
      await screen.findByText(
        /No review notes yet. Add a dated reflection when you revisit this dossier/
      )
    ).toBeInTheDocument();
  });

  it("renders persisted review notes with epistemic and uncited state", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    listReviewNotesMock.mockResolvedValue({
      entries: [reviewNoteFixture]
    });

    render(<App />);

    const reviewNotesSection = (
      await screen.findByRole("heading", {
        name: "Review notes"
      })
    ).closest("section");

    expect(reviewNotesSection).not.toBeNull();
    expect(
      await screen.findByRole("heading", {
        name: "Weekly review"
      })
    ).toBeInTheDocument();
    expect(
      within(reviewNotesSection!).getByText("Inferred")
    ).toBeInTheDocument();
    expect(
      within(reviewNotesSection!).getByText("Uncited")
    ).toBeInTheDocument();
    expect(
      within(reviewNotesSection!).getByText("Apr 26, 2026")
    ).toBeInTheDocument();
  });

  it("opens and cancels the collapsible review note form", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Review notes" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add review note" }));

    expect(
      screen.getByRole("form", { name: "Add review note" })
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Review note title"), {
      target: { value: "Draft review" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("form", { name: "Add review note" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add review note" }));
    expect(screen.getByLabelText("Review note title")).toHaveValue("");
    expect(screen.getByLabelText("Epistemic label")).toHaveValue("inferred");
  });

  it("shows review note form validation errors before calling the create API", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Review notes" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add review note" }));
    fireEvent.click(screen.getByRole("button", { name: "Save review note" }));

    expect(
      await screen.findByText("Enter a review note title.")
    ).toBeInTheDocument();
    expect(screen.getByText("Enter a review note.")).toBeInTheDocument();
    expect(screen.getByText("Choose a review date.")).toBeInTheDocument();
    expect(createReviewNoteMock).not.toHaveBeenCalled();
  });

  it("creates a review note and renders it in the review notes section", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Review notes" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add review note" }));
    fireEvent.change(screen.getByLabelText("Review note title"), {
      target: { value: " Weekly review " }
    });
    fireEvent.change(screen.getByLabelText("Review note"), {
      target: {
        value: " Reviewed recent developments and found no material change. "
      }
    });
    fireEvent.change(screen.getByLabelText("Review date"), {
      target: { value: "2026-04-26" }
    });
    fireEvent.change(screen.getByLabelText("Epistemic label"), {
      target: { value: "inferred" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save review note" }));

    await waitFor(() => {
      expect(createReviewNoteMock).toHaveBeenCalledWith(
        {
          topicId: "topic-1",
          title: "Weekly review",
          bodyMd: "Reviewed recent developments and found no material change.",
          sortAt: "2026-04-26T00:00:00.000Z",
          epistemicStatus: "inferred"
        },
        expect.objectContaining({ onProgress: expect.any(Function) })
      );
    });
    expect(await screen.findByText("Review note saved.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Weekly review" })
    ).toBeInTheDocument();
  });

  it("shows a review note create request error without clearing entered text", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    createReviewNoteMock.mockRejectedValueOnce(
      new Error("database unavailable")
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Review notes" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add review note" }));
    fireEvent.change(screen.getByLabelText("Review note title"), {
      target: { value: "Weekly review" }
    });
    fireEvent.change(screen.getByLabelText("Review note"), {
      target: {
        value: "Reviewed recent developments and found no material change."
      }
    });
    fireEvent.change(screen.getByLabelText("Review date"), {
      target: { value: "2026-04-26" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save review note" }));

    expect(
      await screen.findByText(
        "The database-backed request could not be completed."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Review note title")).toHaveValue(
      "Weekly review"
    );
    expect(screen.getByLabelText("Review note")).toHaveValue(
      "Reviewed recent developments and found no material change."
    );
    expect(screen.getByLabelText("Review date")).toHaveValue("2026-04-26");
  });

  it("shows wake-up progress while loading review notes", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    listReviewNotesMock.mockImplementation(
      async (_request, options) =>
        new Promise<ListReviewNotesResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
  });

  it("shows wake-up progress while creating a review note", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    createReviewNoteMock.mockImplementation(
      async (_request, options) =>
        new Promise<CreateReviewNoteResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Review notes" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add review note" }));
    fireEvent.change(screen.getByLabelText("Review note title"), {
      target: { value: "Weekly review" }
    });
    fireEvent.change(screen.getByLabelText("Review note"), {
      target: {
        value: "Reviewed recent developments and found no material change."
      }
    });
    fireEvent.change(screen.getByLabelText("Review date"), {
      target: { value: "2026-04-26" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save review note" }));

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saving review note..." })
    ).toBeDisabled();
  });

  it("renders the no-assessment empty state on the topic detail route", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    expect(screen.getByText("No assessment yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is derived from the latest active assessment update in the topic history."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add assessment" })
    ).toBeInTheDocument();
  });

  it("renders an existing current assessment on the topic detail route", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    getTopicMock.mockResolvedValue({
      topic: topicFixture,
      currentAssessment: assessmentUpdateFixture
    });

    render(<App />);

    const currentAssessmentSection = (
      await screen.findByRole("heading", {
        name: "Current assessment"
      })
    ).closest("section");

    expect(currentAssessmentSection).not.toBeNull();
    expect(
      within(currentAssessmentSection!).getByText(
        "Escalation risk remains limited."
      )
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentSection!).getByText("Medium")
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentSection!).getByText("35% probability")
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentSection!).getByText(
        "Diplomatic channels remain open"
      )
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentSection!).getByText("Watch for evacuation orders")
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentSection!).getByText(
        "Direct military action occurs."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update assessment" })
    ).toBeInTheDocument();
  });

  it("opens and cancels the inline assessment form", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));

    expect(
      screen.getByRole("form", { name: "Add assessment update" })
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Judgment"), {
      target: { value: "Draft assessment" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("form", { name: "Add assessment update" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));
    expect(screen.getByLabelText("Judgment")).toHaveValue("");
  });

  it("shows assessment form validation errors before calling the create API", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));
    fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));

    expect(
      await screen.findByText("Enter an assessment judgment.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Choose a valid confidence label.")
    ).toBeInTheDocument();
    expect(screen.getByText("Choose an assessment date.")).toBeInTheDocument();
    expect(
      screen.getByText("Enter at least one assumption.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter at least one indicator.")
    ).toBeInTheDocument();
    expect(createAssessmentUpdateMock).not.toHaveBeenCalled();
  });

  it("validates optional assessment probability before calling the create API", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));
    fireEvent.change(screen.getByLabelText("Judgment"), {
      target: { value: "Escalation risk remains limited." }
    });
    fireEvent.change(screen.getByLabelText("Confidence"), {
      target: { value: "medium" }
    });
    fireEvent.change(screen.getByLabelText("Assessment date"), {
      target: { value: "2026-04-25" }
    });
    fireEvent.change(screen.getByLabelText("Assumptions"), {
      target: { value: "Diplomatic channels remain open" }
    });
    fireEvent.change(screen.getByLabelText("Indicators"), {
      target: { value: "Watch for evacuation orders" }
    });
    fireEvent.change(screen.getByLabelText("Probability"), {
      target: { value: "35.5" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));

    expect(
      await screen.findByText("Enter a whole-number probability from 0 to 100.")
    ).toBeInTheDocument();
    expect(createAssessmentUpdateMock).not.toHaveBeenCalled();
  });

  it("creates an assessment update and renders it as the current assessment", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));
    fireEvent.change(screen.getByLabelText("Judgment"), {
      target: { value: " Escalation risk remains limited. " }
    });
    fireEvent.change(screen.getByLabelText("Confidence"), {
      target: { value: "medium" }
    });
    fireEvent.change(screen.getByLabelText("Assessment date"), {
      target: { value: "2026-04-25" }
    });
    fireEvent.change(screen.getByLabelText("Assumptions"), {
      target: {
        value: " Diplomatic channels remain open \n No direct strike "
      }
    });
    fireEvent.change(screen.getByLabelText("Indicators"), {
      target: { value: " Watch for evacuation orders " }
    });
    fireEvent.change(screen.getByLabelText("Probability"), {
      target: { value: "35" }
    });
    fireEvent.change(screen.getByLabelText("Resolution criteria"), {
      target: { value: " Direct military action occurs. " }
    });
    fireEvent.change(screen.getByLabelText("Target resolution date"), {
      target: { value: "2026-05-25" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));

    await waitFor(() => {
      expect(createAssessmentUpdateMock).toHaveBeenCalledWith(
        {
          topicId: "topic-1",
          judgment: "Escalation risk remains limited.",
          confidenceLabel: "medium",
          probabilityPct: 35,
          assumptions: ["Diplomatic channels remain open", "No direct strike"],
          indicators: ["Watch for evacuation orders"],
          resolutionCriteria: "Direct military action occurs.",
          targetResolvesAt: "2026-05-25T00:00:00.000Z",
          sortAt: "2026-04-25T00:00:00.000Z"
        },
        expect.objectContaining({ onProgress: expect.any(Function) })
      );
    });
    expect(await screen.findByText("Assessment saved.")).toBeInTheDocument();
    expect(
      screen.getByText("Escalation risk remains limited.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Diplomatic channels remain open")
    ).toBeInTheDocument();
    expect(screen.getByText("35% probability")).toBeInTheDocument();
  });

  it("shows an assessment create request error without clearing entered text", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    createAssessmentUpdateMock.mockRejectedValueOnce(
      new Error("database unavailable")
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));
    fireEvent.change(screen.getByLabelText("Judgment"), {
      target: { value: "Escalation risk remains limited." }
    });
    fireEvent.change(screen.getByLabelText("Confidence"), {
      target: { value: "medium" }
    });
    fireEvent.change(screen.getByLabelText("Assessment date"), {
      target: { value: "2026-04-25" }
    });
    fireEvent.change(screen.getByLabelText("Assumptions"), {
      target: { value: "Diplomatic channels remain open" }
    });
    fireEvent.change(screen.getByLabelText("Indicators"), {
      target: { value: "Watch for evacuation orders" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));

    expect(
      await screen.findByText(
        "The database-backed request could not be completed."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Judgment")).toHaveValue(
      "Escalation risk remains limited."
    );
    expect(screen.getByLabelText("Assessment date")).toHaveValue("2026-04-25");
  });

  it("shows wake-up progress while creating an assessment update", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    createAssessmentUpdateMock.mockImplementation(
      async (_request, options) =>
        new Promise<CreateAssessmentUpdateResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));
    fireEvent.change(screen.getByLabelText("Judgment"), {
      target: { value: "Escalation risk remains limited." }
    });
    fireEvent.change(screen.getByLabelText("Confidence"), {
      target: { value: "medium" }
    });
    fireEvent.change(screen.getByLabelText("Assessment date"), {
      target: { value: "2026-04-25" }
    });
    fireEvent.change(screen.getByLabelText("Assumptions"), {
      target: { value: "Diplomatic channels remain open" }
    });
    fireEvent.change(screen.getByLabelText("Indicators"), {
      target: { value: "Watch for evacuation orders" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saving assessment..." })
    ).toBeDisabled();
  });

  it("renders non-interactive empty states for future R1 dossier sections", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    for (const sectionName of [
      "Evidence and citations",
      "Review workflow",
      "Export"
    ]) {
      const section = screen
        .getByRole("heading", { name: sectionName })
        .closest("article");

      expect(section).not.toBeNull();
      expect(
        within(section!).getByText("Shell only. Not functional yet.")
      ).toBeInTheDocument();
      expect(within(section!).queryByRole("button")).not.toBeInTheDocument();
      expect(within(section!).queryByRole("link")).not.toBeInTheDocument();
    }
  });

  it("renders a not-found state for a missing topic", async () => {
    window.history.pushState({}, "", "/topics/topic-missing");
    getTopicMock.mockRejectedValue(
      new SignalTrackerApiError(404, "TOPIC_NOT_FOUND", "Topic not found")
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "No topic dossier found" })
    ).toBeInTheDocument();
    expect(screen.getByText("topic-missing")).toBeInTheDocument();
    expect(
      screen.queryByText("The database-backed request could not be completed.")
    ).not.toBeInTheDocument();
  });

  it("shows a topic detail request error with a retry affordance", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    getTopicMock
      .mockRejectedValueOnce(new Error("database unavailable"))
      .mockResolvedValueOnce(getTopicResponse);

    render(<App />);

    expect(
      await screen.findByText(
        "The database-backed request could not be completed."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(getTopicMock).toHaveBeenCalledTimes(2);
  });

  it("shows the shared wake-up status when get-topic reports waking progress", async () => {
    window.history.pushState({}, "", "/topics/topic-1");
    getTopicMock.mockImplementation(
      async (_request, options) =>
        new Promise<GetTopicResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
  });

  it("shows a final create-topic request error with a retry affordance", async () => {
    window.history.pushState({}, "", "/topics/new");
    createTopicMock
      .mockRejectedValueOnce(new Error("database unavailable"))
      .mockResolvedValueOnce(createdTopicResponse);

    render(<App />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Iran strike risk" }
    });
    fireEvent.change(screen.getByLabelText("Framing question"), {
      target: { value: "Will tensions escalate?" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create topic" }));

    expect(
      await screen.findByText(
        "The database-backed request could not be completed."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(createTopicMock).toHaveBeenCalledTimes(2);
    });
  });

  it("shows the shared wake-up status when create-topic reports waking progress", async () => {
    window.history.pushState({}, "", "/topics/new");
    createTopicMock.mockImplementation(
      async (_request, options) =>
        new Promise<CreateTopicResponse>(() => {
          options?.onProgress?.({
            phase: "waking",
            attempt: 1,
            maxAttempts: 3
          });
        })
    );

    render(<App />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Iran strike risk" }
    });
    fireEvent.change(screen.getByLabelText("Framing question"), {
      target: { value: "Will tensions escalate?" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create topic" }));

    expect(
      await screen.findByText(/The database is waking up after inactivity/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Creating topic..." })
    ).toBeDisabled();
  });

  it("keeps R1 copy clear of deferred monitoring and AI behavior", async () => {
    window.history.pushState({}, "", "/topics/topic-1");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/signal ingestion/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/source bias/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/alerts/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AI summaries/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/social monitoring/i)).not.toBeInTheDocument();
  });

  it("renders an error message when the health check fails", async () => {
    fetchHealthStatusMock.mockRejectedValue(new Error("network"));

    render(<App />);

    expect(
      await screen.findByText("API scaffold unavailable.")
    ).toBeInTheDocument();
  });
});
