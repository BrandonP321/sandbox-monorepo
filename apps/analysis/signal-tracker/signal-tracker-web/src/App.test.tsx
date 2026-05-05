import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ArchiveTopicResponse,
  AssessmentUpdate,
  CreateAssessmentUpdateResponse,
  DeleteTopicResponse,
  GetTopicResponse,
  Topic,
  UpdateTopicResponse
} from "@repo/signal-tracker-shared";

import { getApiErrorMessage } from "./api/apiError";
import App from "./App";

const apiMocks = vi.hoisted(() => ({
  useArchiveTopicMutation: vi.fn(),
  useCreateAssessmentUpdateMutation: vi.fn(),
  useCreateTopicMutation: vi.fn(),
  useDeleteTopicMutation: vi.fn(),
  useGetTopicQuery: vi.fn(),
  useListTopicsQuery: vi.fn(),
  useUpdateTopicMutation: vi.fn()
}));

vi.mock("@/api", () => {
  return {
    useArchiveTopicMutation: apiMocks.useArchiveTopicMutation,
    useCreateAssessmentUpdateMutation:
      apiMocks.useCreateAssessmentUpdateMutation,
    useCreateTopicMutation: apiMocks.useCreateTopicMutation,
    useDeleteTopicMutation: apiMocks.useDeleteTopicMutation,
    useGetTopicQuery: apiMocks.useGetTopicQuery,
    useListTopicsQuery: apiMocks.useListTopicsQuery,
    useUpdateTopicMutation: apiMocks.useUpdateTopicMutation
  };
});

const topic = {
  id: "topic-1",
  title: "Iran strike risk",
  framingQuestion: "Will the conflict expand over the next month?",
  scopeNote: "Track official signals and military movements.",
  status: "active",
  reviewCadence: "weekly",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
} as const satisfies Topic;

const topicWithoutScopeNote = {
  ...topic,
  id: "topic-2",
  title: "AI copyright litigation",
  framingQuestion: "Which rulings materially change model training risk?",
  scopeNote: undefined
} as const satisfies Topic;

const createdTopic = {
  ...topic,
  id: "topic-created",
  title: "New topic",
  framingQuestion: "What changed?",
  scopeNote: undefined,
  reviewCadence: "ad_hoc"
} as const satisfies Topic;

const archivedTopic = {
  ...topic,
  id: "topic-archived",
  title: "Archived topic",
  status: "archived",
  archivedAt: "2026-01-03T00:00:00.000Z"
} as const satisfies Topic;

const currentAssessment = {
  entry: {
    id: "assessment-entry-1",
    topicId: topic.id,
    kind: "assessment",
    epistemicStatus: "inferred",
    title: "Strike risk assessment",
    bodyMd: "Risk is rising.",
    sortAt: "2026-05-01T00:00:00.000Z",
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  },
  judgment: "Risk is rising but still constrained by diplomatic incentives.",
  confidenceLabel: "medium",
  probabilityPct: 55,
  assumptions: ["Backchannel talks remain active."],
  indicators: ["Watch for evacuation orders."],
  resolutionCriteria: undefined,
  targetResolvesAt: undefined,
  previousAssessmentEntryId: undefined
} as const satisfies AssessmentUpdate;

type ListTopicsHookResult = {
  data?: { topics: Topic[] };
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};

type GetTopicHookResult = {
  data?: GetTopicResponse;
  error?: unknown;
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};

type MutationHookResult<TResult> = [
  (request: unknown) => { unwrap: () => Promise<TResult> },
  { errorMessage?: string; isLoading: boolean }
];

let applyTopicUpdate: (topic: Topic) => void = () => undefined;

describe("App", () => {
  const archiveTopic = vi.fn();
  const createAssessmentUpdate = vi.fn();
  const createTopic = vi.fn();
  const deleteTopic = vi.fn();
  const updateTopic = vi.fn();
  const unwrapArchiveTopic = vi.fn();
  const unwrapCreateAssessmentUpdate = vi.fn();
  const unwrapCreateTopic = vi.fn();
  const unwrapDeleteTopic = vi.fn();
  const unwrapUpdateTopic = vi.fn();

  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    archiveTopic.mockReset();
    createAssessmentUpdate.mockReset();
    createTopic.mockReset();
    deleteTopic.mockReset();
    updateTopic.mockReset();
    unwrapArchiveTopic.mockReset();
    unwrapCreateAssessmentUpdate.mockReset();
    unwrapCreateTopic.mockReset();
    unwrapDeleteTopic.mockReset();
    unwrapUpdateTopic.mockReset();
    applyTopicUpdate = () => undefined;
    apiMocks.useArchiveTopicMutation.mockReset();
    apiMocks.useCreateAssessmentUpdateMutation.mockReset();
    apiMocks.useCreateTopicMutation.mockReset();
    apiMocks.useDeleteTopicMutation.mockReset();
    apiMocks.useGetTopicQuery.mockReset();
    apiMocks.useListTopicsQuery.mockReset();
    apiMocks.useUpdateTopicMutation.mockReset();
    mockArchiveTopicMutation();
    mockCreateAssessmentUpdateMutation();
    mockCreateTopicMutation();
    mockDeleteTopicMutation();
    mockGetTopicQuery();
    mockListTopicsQuery({ data: { topics: [topic] } });
    mockUpdateTopicMutation();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the List Topics page as the default route", async () => {
    renderApp();

    await expectListTopicsPage();
    expect(
      screen.getByRole("heading", { level: 2, name: "Active topics" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Search topics" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create topic" })).toBeEnabled();
    expect(screen.queryByText("Workspace surfaces")).not.toBeInTheDocument();
  });

  it("opens and cancels the create topic dialog without preserving draft input", async () => {
    renderApp();
    const dialog = await openCreateTopicDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: "Draft topic" }
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const reopenedDialog = await openCreateTopicDialog();

    expect(
      within(reopenedDialog).getByRole("textbox", { name: "Title" })
    ).toHaveValue("");
  });

  it("shows create topic validation before calling the API", async () => {
    renderApp();
    const dialog = await openCreateTopicDialog();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create topic" })
    );

    expect(await screen.findByText("Enter a topic title.")).toBeInTheDocument();
    expect(screen.getByText("Enter a framing question.")).toBeInTheDocument();
    expect(createTopic).not.toHaveBeenCalled();
  });

  it("submits create topic through the shared request shape and navigates to the new topic", async () => {
    renderApp();
    const dialog = await openCreateTopicDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: " New topic " }
    });
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Framing question" }),
      {
        target: { value: " What changed? " }
      }
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create topic" })
    );

    await waitFor(() => {
      expect(createTopic).toHaveBeenCalledWith({
        title: "New topic",
        framingQuestion: "What changed?",
        scopeNote: undefined,
        reviewCadence: "ad_hoc"
      });
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: "New topic" })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/topics/topic-created");
  });

  it("sends the optional scope note when provided", async () => {
    renderApp();
    const dialog = await openCreateTopicDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: "New topic" }
    });
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Framing question" }),
      {
        target: { value: "What changed?" }
      }
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Scope note" }),
      {
        target: { value: " Track only official statements. " }
      }
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create topic" })
    );

    await waitFor(() => {
      expect(createTopic).toHaveBeenCalledWith({
        title: "New topic",
        framingQuestion: "What changed?",
        scopeNote: "Track only official statements.",
        reviewCadence: "ad_hoc"
      });
    });
  });

  it("shows create topic API failures without clearing entered values", async () => {
    unwrapCreateTopic.mockRejectedValueOnce({
      status: 400,
      data: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Topic title is already in use."
        }
      }
    });
    renderApp();
    const dialog = await openCreateTopicDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: "New topic" }
    });
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Framing question" }),
      {
        target: { value: "What changed?" }
      }
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create topic" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Topic title is already in use."
    );
    expect(within(dialog).getByRole("textbox", { name: "Title" })).toHaveValue(
      "New topic"
    );
    expect(
      within(dialog).getByRole("textbox", { name: "Framing question" })
    ).toHaveValue("What changed?");
  });

  it("disables duplicate create topic submission while the mutation is pending", async () => {
    let resolveCreateTopic: (value: unknown) => void = () => undefined;
    unwrapCreateTopic.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCreateTopic = resolve;
      })
    );
    renderApp();
    const dialog = await openCreateTopicDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: "New topic" }
    });
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Framing question" }),
      {
        target: { value: "What changed?" }
      }
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create topic" })
    );

    expect(
      await within(dialog).findByRole("button", { name: "Creating topic..." })
    ).toBeDisabled();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Creating topic..." })
    );
    expect(createTopic).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCreateTopic({ topic: createdTopic });
    });
  });

  it("renders a compact loading state for active topics", async () => {
    mockListTopicsQuery({ data: undefined, isLoading: true });

    renderApp();

    expect(
      await screen.findByText("Loading active topics")
    ).toBeInTheDocument();
  });

  it("renders an empty state when there are no active topics", async () => {
    mockListTopicsQuery({ data: { topics: [] } });

    renderApp();

    expect(
      await screen.findByText("No active topics yet.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Create topic will start the next topic dossier.")
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Create topic" })
    ).toHaveLength(2);
  });

  it("renders populated topic rows from the current Topic contract", async () => {
    mockListTopicsQuery({
      data: { topics: [topic, topicWithoutScopeNote] }
    });

    renderApp();

    expect(await screen.findByText("Iran strike risk")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Iran strike risk/ })).toHaveClass(
      "block"
    );
    expect(
      screen.getByText("Will the conflict expand over the next month?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Track official signals and military movements.")
    ).toBeInTheDocument();
    expect(screen.getByText("AI copyright litigation")).toBeInTheDocument();
    expect(screen.queryByText("weekly")).not.toBeInTheDocument();
    expect(screen.queryByText("active")).not.toBeInTheDocument();
    expect(
      screen.queryByText("2026-01-01T00:00:00.000Z")
    ).not.toBeInTheDocument();
  });

  it("renders an inline error state with retry behavior", async () => {
    const retry = mockListTopicsQuery({
      data: undefined,
      errorMessage: "Topic list is temporarily unavailable.",
      isError: true
    });

    renderApp();

    expect(
      await screen.findByText("Topics could not be loaded.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Topic list is temporarily unavailable.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("debounces search before using the existing list topics query contract", async () => {
    renderApp();
    await expectListTopicsPage();

    fireEvent.change(screen.getByRole("textbox", { name: "Search topics" }), {
      target: { value: "Iran" }
    });

    expect(apiMocks.useListTopicsQuery).toHaveBeenLastCalledWith({
      query: undefined
    });

    await waitFor(() => {
      expect(apiMocks.useListTopicsQuery).toHaveBeenLastCalledWith({
        query: "Iran"
      });
    });
  });

  it("distinguishes empty search results from no active topics", async () => {
    apiMocks.useListTopicsQuery.mockImplementation(
      ({ query }: { query?: string }) => ({
        data: { topics: query ? [] : [topic] },
        isError: false,
        isLoading: false,
        refetch: vi.fn()
      })
    );

    renderApp();
    await expectListTopicsPage();

    fireEvent.change(screen.getByRole("textbox", { name: "Search topics" }), {
      target: { value: "missing" }
    });
    expect(
      await screen.findByText("No matching topics found.")
    ).toBeInTheDocument();
    expect(screen.queryByText("No active topics yet.")).not.toBeInTheDocument();
  });

  it("navigates topic selection to the topic details route", async () => {
    renderApp();

    fireEvent.click(
      await screen.findByRole("link", { name: /Iran strike risk/ })
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/topics/topic-1");
    expect(apiMocks.useGetTopicQuery).toHaveBeenLastCalledWith({
      topicId: "topic-1"
    });
    expect(
      screen.getByText("Will the conflict expand over the next month?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Track official signals and military movements.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to topics" })
    ).toHaveAttribute("href", "/topics");
    expect(screen.getByRole("button", { name: "Add entry" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Topic settings" })
    ).toBeEnabled();
    expect(
      screen.getByRole("region", { name: "Timeline" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Current assessment" })
    ).toBeInTheDocument();
    expect(screen.getByText("No assessment yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add assessment" })
    ).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));
    expect(
      await screen.findByRole("dialog", { name: "Add assessment" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Topic ID: topic-1")).not.toBeInTheDocument();
  });

  it("opens and closes topic settings with current metadata pre-filled", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();

    const dialog = await openTopicSettingsDialog();

    expect(within(dialog).getByRole("textbox", { name: "Title" })).toHaveValue(
      "Iran strike risk"
    );
    expect(
      within(dialog).getByRole("textbox", { name: "Framing question" })
    ).toHaveValue("Will the conflict expand over the next month?");
    expect(
      within(dialog).getByRole("textbox", { name: "Scope note" })
    ).toHaveValue("Track official signals and military movements.");

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("validates topic settings before submitting metadata updates", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: "" }
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save changes" })
    );

    expect(await screen.findByText("Enter a topic title.")).toBeInTheDocument();
    expect(updateTopic).not.toHaveBeenCalled();
  });

  it("submits topic settings updates through the shared update shape", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: " Updated topic " }
    });
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Framing question" }),
      {
        target: { value: " What changed materially? " }
      }
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Scope note" }),
      {
        target: { value: " Track official sources only. " }
      }
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save changes" })
    );

    await waitFor(() => {
      expect(updateTopic).toHaveBeenCalledWith({
        topicId: "topic-1",
        title: "Updated topic",
        framingQuestion: "What changed materially?",
        scopeNote: "Track official sources only."
      });
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Updated topic" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps entered topic settings values after update failure", async () => {
    unwrapUpdateTopic.mockRejectedValueOnce({
      status: 400,
      data: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Topic title is already in use."
        }
      }
    });
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: "Duplicate topic" }
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save changes" })
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Topic title is already in use."
    );
    expect(within(dialog).getByRole("textbox", { name: "Title" })).toHaveValue(
      "Duplicate topic"
    );
  });

  it("archives a topic from settings and returns to active topics", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    expect(
      within(dialog).getByText(
        "Archive hides this topic from the active topic flow without deleting its analytical history."
      )
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Archive topic" })
    );

    await waitFor(() => {
      expect(archiveTopic).toHaveBeenCalledWith({ topicId: "topic-1" });
      expect(window.location.pathname).toBe("/topics");
    });
  });

  it("shows archive failures without leaving topic settings", async () => {
    unwrapArchiveTopic.mockRejectedValueOnce({
      status: 503,
      data: {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Archive is temporarily unavailable."
        }
      }
    });
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Archive topic" })
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Archive is temporarily unavailable."
    );
    expect(window.location.pathname).toBe("/topics/topic-1");
  });

  it("requires exact-title confirmation before hard deleting a topic", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    expect(
      within(dialog).getByText(
        "Delete permanently removes this topic. Use archive when you only want to remove it from active work."
      )
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete topic" })
    );

    const alertDialog = await screen.findByRole("alertdialog", {
      name: "Delete topic permanently?"
    });
    const confirmButton = within(alertDialog).getByRole("button", {
      name: "Delete permanently"
    });

    expect(confirmButton).toBeDisabled();
    expect(deleteTopic).not.toHaveBeenCalled();

    fireEvent.change(
      within(alertDialog).getByRole("textbox", { name: "Topic title" }),
      {
        target: { value: "Iran" }
      }
    );
    expect(confirmButton).toBeDisabled();

    fireEvent.change(
      within(alertDialog).getByRole("textbox", { name: "Topic title" }),
      {
        target: { value: "Iran strike risk" }
      }
    );
    expect(confirmButton).toBeEnabled();
  });

  it("hard deletes a topic only after confirmation and returns to active topics", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete topic" })
    );
    const alertDialog = await screen.findByRole("alertdialog", {
      name: "Delete topic permanently?"
    });
    fireEvent.change(
      within(alertDialog).getByRole("textbox", { name: "Topic title" }),
      {
        target: { value: "Iran strike risk" }
      }
    );
    fireEvent.click(
      within(alertDialog).getByRole("button", { name: "Delete permanently" })
    );

    await waitFor(() => {
      expect(deleteTopic).toHaveBeenCalledWith({ topicId: "topic-1" });
      expect(window.location.pathname).toBe("/topics");
    });
  });

  it("shows delete failures without leaving the confirmation flow", async () => {
    unwrapDeleteTopic.mockRejectedValueOnce({
      status: 503,
      data: {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Delete is temporarily unavailable."
        }
      }
    });
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete topic" })
    );
    const alertDialog = await screen.findByRole("alertdialog", {
      name: "Delete topic permanently?"
    });
    fireEvent.change(
      within(alertDialog).getByRole("textbox", { name: "Topic title" }),
      {
        target: { value: "Iran strike risk" }
      }
    );
    fireEvent.click(
      within(alertDialog).getByRole("button", { name: "Delete permanently" })
    );

    expect(await within(alertDialog).findByRole("alert")).toHaveTextContent(
      "Delete is temporarily unavailable."
    );
    expect(window.location.pathname).toBe("/topics/topic-1");
  });

  it("prevents duplicate topic settings actions while mutations are pending", async () => {
    let resolveUpdate: (value: UpdateTopicResponse) => void = () => undefined;
    unwrapUpdateTopic.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      })
    );
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.change(within(dialog).getByRole("textbox", { name: "Title" }), {
      target: { value: "Pending update" }
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save changes" })
    );

    expect(
      await within(dialog).findByRole("button", { name: "Saving changes..." })
    ).toBeDisabled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Saving changes..." })
    );

    expect(updateTopic).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveUpdate({ topic: { ...topic, title: "Pending update" } });
    });
  });

  it("prevents duplicate archive requests while archive is pending", async () => {
    let resolveArchive: (value: ArchiveTopicResponse) => void = () => undefined;
    unwrapArchiveTopic.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveArchive = resolve;
      })
    );
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Archive topic" })
    );

    expect(
      await within(dialog).findByRole("button", { name: "Archiving topic..." })
    ).toBeDisabled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Archiving topic..." })
    );

    expect(archiveTopic).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveArchive({ topic: archivedTopic });
    });
  });

  it("prevents duplicate hard delete requests while delete is pending", async () => {
    let resolveDelete: (value: DeleteTopicResponse) => void = () => undefined;
    unwrapDeleteTopic.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDelete = resolve;
      })
    );
    window.history.replaceState(null, "", "/topics/topic-1");
    renderApp();
    const dialog = await openTopicSettingsDialog();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete topic" })
    );
    const alertDialog = await screen.findByRole("alertdialog", {
      name: "Delete topic permanently?"
    });
    fireEvent.change(
      within(alertDialog).getByRole("textbox", { name: "Topic title" }),
      {
        target: { value: "Iran strike risk" }
      }
    );
    fireEvent.click(
      within(alertDialog).getByRole("button", { name: "Delete permanently" })
    );

    expect(
      await within(alertDialog).findByRole("button", {
        name: "Deleting topic..."
      })
    ).toBeDisabled();
    fireEvent.click(
      within(alertDialog).getByRole("button", { name: "Deleting topic..." })
    );

    expect(deleteTopic).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDelete({ topic });
    });
  });

  it("renders the topic details route from a direct URL", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");

    renderApp();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Iran strike risk" })
    ).toBeInTheDocument();
    expect(apiMocks.useGetTopicQuery).toHaveBeenLastCalledWith({
      topicId: "topic-1"
    });
  });

  it("renders the current assessment returned by the topic details query", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    mockGetTopicQuery({
      data: { topic, currentAssessment }
    });

    renderApp();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Iran strike risk" })
    ).toBeInTheDocument();

    const currentAssessmentRegion = screen.getByRole("complementary", {
      name: "Current assessment"
    });

    expect(
      within(currentAssessmentRegion).getByText(
        "Risk is rising but still constrained by diplomatic incentives."
      )
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentRegion).getByText("Medium")
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentRegion).getByText("55% probability")
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentRegion).getByText("May 1, 2026")
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentRegion).getByText(
        "Backchannel talks remain active."
      )
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentRegion).getByText("Watch for evacuation orders.")
    ).toBeInTheDocument();
    expect(
      within(currentAssessmentRegion).getByRole("button", {
        name: "Update assessment"
      })
    ).toBeEnabled();
  });

  it("submits an assessment update from topic details with the route topic ID", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");

    renderApp();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Iran strike risk" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add assessment" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fillAssessmentComposer(dialog);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    await waitFor(() => {
      expect(createAssessmentUpdate).toHaveBeenCalledWith({
        topicId: "topic-1",
        judgment: "Escalation risk remains limited.",
        confidenceLabel: "medium",
        assumptions: ["Diplomatic channels remain open"],
        indicators: ["Watch for evacuation orders"],
        sortAt: "2026-04-25T00:00:00.000Z"
      });
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("omits the compact scope note when the topic has none", async () => {
    window.history.replaceState(null, "", "/topics/topic-2");
    mockGetTopicQuery({
      data: { topic: topicWithoutScopeNote, currentAssessment: null }
    });

    renderApp();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "AI copyright litigation"
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Track official signals and military movements.")
    ).not.toBeInTheDocument();
  });

  it("shows archived status only when a direct archived topic URL is opened", async () => {
    window.history.replaceState(null, "", "/topics/topic-archived");
    mockGetTopicQuery({
      data: { topic: archivedTopic, currentAssessment: null }
    });

    renderApp();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Archived topic" })
    ).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("renders a structured loading state for topic details", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    mockGetTopicQuery({ data: undefined, isLoading: true });

    renderApp();

    expect(
      await screen.findByText("Loading topic details")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Back to topics" })
    ).not.toBeInTheDocument();
  });

  it("renders a topic details error state with retry behavior", async () => {
    window.history.replaceState(null, "", "/topics/topic-1");
    const retry = mockGetTopicQuery({
      data: undefined,
      error: {
        status: 503,
        data: {
          error: {
            code: "DATABASE_UNAVAILABLE",
            message: "Topic details are temporarily unavailable."
          }
        }
      },
      errorMessage: "Topic details are temporarily unavailable.",
      isError: true
    });

    renderApp();

    expect(
      await screen.findByText("Topic could not be loaded.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Topic details are temporarily unavailable.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("renders topic not found without the generic retry error", async () => {
    window.history.replaceState(null, "", "/topics/topic-missing");
    mockGetTopicQuery({
      data: undefined,
      error: {
        status: 404,
        data: {
          error: {
            code: "TOPIC_NOT_FOUND",
            message: "Topic not found"
          }
        }
      },
      errorMessage: "Topic not found",
      isError: true
    });

    renderApp();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Topic not found" })
    ).toBeInTheDocument();
    expect(screen.getByText("Topic not found.")).toBeInTheDocument();
    expect(
      screen.getByText("No topic matched topic-missing.")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Topic could not be loaded.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Retry" })
    ).not.toBeInTheDocument();
  });

  it("renders the list page for the /topics route", async () => {
    window.history.replaceState(null, "", "/topics");

    renderApp();

    await expectListTopicsPage();
  });

  it("does not render temporary backend scaffold copy", async () => {
    renderApp();
    await expectListTopicsPage();

    expect(
      screen.queryByRole("button", { name: "Verify Button" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("UI foundation")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Tailwind CSS and the local shadcn-style Button are wired in."
      )
    ).not.toBeInTheDocument();
  });

  function mockCreateAssessmentUpdateMutation({
    isLoading = false
  }: { isLoading?: boolean } = {}) {
    unwrapCreateAssessmentUpdate.mockResolvedValue({
      assessmentUpdate: currentAssessment
    } satisfies CreateAssessmentUpdateResponse);
    apiMocks.useCreateAssessmentUpdateMutation.mockImplementation(
      function useMockCreateAssessmentUpdateMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function createAssessmentUpdateTrigger(request: unknown) {
          createAssessmentUpdate(request);

          return {
            async unwrap() {
              try {
                return await unwrapCreateAssessmentUpdate(request);
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [
          createAssessmentUpdateTrigger,
          { errorMessage, isLoading }
        ] satisfies MutationHookResult<CreateAssessmentUpdateResponse>;
      }
    );
  }

  function mockCreateTopicMutation({
    isLoading = false
  }: { isLoading?: boolean } = {}) {
    unwrapCreateTopic.mockResolvedValue({ topic: createdTopic });
    apiMocks.useCreateTopicMutation.mockImplementation(
      function useMockCreateTopicMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function createTopicTrigger(request: unknown) {
          createTopic(request);

          return {
            async unwrap() {
              try {
                return await unwrapCreateTopic();
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [
          createTopicTrigger,
          { errorMessage, isLoading }
        ] satisfies MutationHookResult<{ topic: Topic }>;
      }
    );
  }

  function mockArchiveTopicMutation({
    isLoading = false
  }: { isLoading?: boolean } = {}) {
    unwrapArchiveTopic.mockResolvedValue({
      topic: archivedTopic
    } satisfies ArchiveTopicResponse);
    apiMocks.useArchiveTopicMutation.mockImplementation(
      function useMockArchiveTopicMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function archiveTopicTrigger(request: unknown) {
          archiveTopic(request);

          return {
            async unwrap() {
              try {
                return await unwrapArchiveTopic();
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [
          archiveTopicTrigger,
          { errorMessage, isLoading }
        ] satisfies MutationHookResult<ArchiveTopicResponse>;
      }
    );
  }

  function mockDeleteTopicMutation({
    isLoading = false
  }: { isLoading?: boolean } = {}) {
    unwrapDeleteTopic.mockResolvedValue({
      topic
    } satisfies DeleteTopicResponse);
    apiMocks.useDeleteTopicMutation.mockImplementation(
      function useMockDeleteTopicMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function deleteTopicTrigger(request: unknown) {
          deleteTopic(request);

          return {
            async unwrap() {
              try {
                return await unwrapDeleteTopic();
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [
          deleteTopicTrigger,
          { errorMessage, isLoading }
        ] satisfies MutationHookResult<DeleteTopicResponse>;
      }
    );
  }

  function mockUpdateTopicMutation({
    isLoading = false
  }: { isLoading?: boolean } = {}) {
    unwrapUpdateTopic.mockImplementation(async (request: unknown) => {
      const updateRequest = request as {
        framingQuestion?: string;
        scopeNote?: null | string;
        title?: string;
      };

      return {
        topic: {
          ...topic,
          title: updateRequest.title ?? topic.title,
          framingQuestion:
            updateRequest.framingQuestion ?? topic.framingQuestion,
          scopeNote:
            updateRequest.scopeNote === null
              ? undefined
              : (updateRequest.scopeNote ?? topic.scopeNote),
          updatedAt: "2026-01-02T00:00:00.000Z"
        }
      } satisfies UpdateTopicResponse;
    });
    apiMocks.useUpdateTopicMutation.mockImplementation(
      function useMockUpdateTopicMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function updateTopicTrigger(request: unknown) {
          updateTopic(request);

          return {
            async unwrap() {
              try {
                const response = await unwrapUpdateTopic(request);
                applyTopicUpdate(response.topic);
                return response;
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [
          updateTopicTrigger,
          { errorMessage, isLoading }
        ] satisfies MutationHookResult<UpdateTopicResponse>;
      }
    );
  }
});

function mockListTopicsQuery(
  overrides: Partial<ListTopicsHookResult> = {}
): () => void {
  const refetch = vi.fn();

  apiMocks.useListTopicsQuery.mockReturnValue({
    data: { topics: [] },
    isError: false,
    isLoading: false,
    refetch,
    ...overrides
  } satisfies ListTopicsHookResult);

  return refetch;
}

function mockGetTopicQuery(
  overrides: Partial<GetTopicHookResult> = {}
): () => void {
  const refetch = vi.fn();

  apiMocks.useGetTopicQuery.mockImplementation(
    ({ topicId }: { topicId: string }) => {
      const resolvedTopic = topicId === createdTopic.id ? createdTopic : topic;
      const [currentTopic, setCurrentTopic] = useState<Topic>(resolvedTopic);

      applyTopicUpdate = setCurrentTopic;

      return {
        data: { topic: currentTopic, currentAssessment: null },
        isError: false,
        isLoading: false,
        refetch,
        ...overrides
      } satisfies GetTopicHookResult;
    }
  );

  return refetch;
}

function renderApp() {
  return render(<App />);
}

async function expectListTopicsPage() {
  expect(
    await screen.findByRole("heading", { level: 1, name: "Topics" })
  ).toBeInTheDocument();
}

async function openCreateTopicDialog() {
  fireEvent.click(await screen.findByRole("button", { name: "Create topic" }));

  return screen.findByRole("dialog", { name: "Create topic" });
}

async function openTopicSettingsDialog() {
  expect(
    await screen.findByRole("heading", { level: 1, name: "Iran strike risk" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Topic settings" }));

  return screen.findByRole("dialog", { name: "Topic settings" });
}

function fillAssessmentComposer(dialog: HTMLElement) {
  fireEvent.change(within(dialog).getByLabelText("Judgment"), {
    target: { value: " Escalation risk remains limited. " }
  });
  fireEvent.change(within(dialog).getByLabelText("Confidence"), {
    target: { value: "medium" }
  });
  fireEvent.change(within(dialog).getByLabelText("Assessment date"), {
    target: { value: "2026-04-25" }
  });
  fireEvent.change(within(dialog).getByLabelText("Assumptions"), {
    target: { value: " Diplomatic channels remain open " }
  });
  fireEvent.change(within(dialog).getByLabelText("Indicators"), {
    target: { value: " Watch for evacuation orders " }
  });
}
