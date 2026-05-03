import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Topic } from "@repo/signal-tracker-shared";

import App from "./App";

const apiMocks = vi.hoisted(() => ({
  useListTopicsQuery: vi.fn()
}));

vi.mock("@/api", () => {
  return {
    useListTopicsQuery: apiMocks.useListTopicsQuery
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

type ListTopicsHookResult = {
  data?: { topics: Topic[] };
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};

describe("App", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    apiMocks.useListTopicsQuery.mockReset();
    mockListTopicsQuery({ data: { topics: [topic] } });
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
    expect(screen.getByRole("button", { name: "Create topic" })).toBeDisabled();
    expect(screen.queryByText("Workspace surfaces")).not.toBeInTheDocument();
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
      isError: true
    });

    renderApp();

    expect(
      await screen.findByText("Topics could not be loaded.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("debounces search before using the existing list topics query contract", async () => {
    renderApp();
    await expectListTopicsPage();
    vi.useFakeTimers();

    fireEvent.change(screen.getByRole("textbox", { name: "Search topics" }), {
      target: { value: "Iran" }
    });

    expect(apiMocks.useListTopicsQuery).toHaveBeenLastCalledWith({
      query: undefined
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(apiMocks.useListTopicsQuery).toHaveBeenLastCalledWith({
      query: "Iran"
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
    vi.useFakeTimers();

    fireEvent.change(screen.getByRole("textbox", { name: "Search topics" }), {
      target: { value: "missing" }
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText("No matching topics found.")).toBeInTheDocument();
    expect(screen.queryByText("No active topics yet.")).not.toBeInTheDocument();
  });

  it("navigates topic selection to the topic details route", async () => {
    renderApp();

    fireEvent.click(
      await screen.findByRole("link", { name: /Iran strike risk/ })
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Topic Details" })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/topics/topic-1");
    expect(screen.getByText("Topic ID: topic-1")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to topics" })
    ).toHaveAttribute("href", "/topics");
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

function renderApp() {
  return render(<App />);
}

async function expectListTopicsPage() {
  expect(
    await screen.findByRole("heading", { level: 1, name: "Topics" })
  ).toBeInTheDocument();
}
