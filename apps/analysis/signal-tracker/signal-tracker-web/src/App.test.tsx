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

import type { Topic } from "@repo/signal-tracker-shared";

import { getApiErrorMessage } from "./api/apiError";
import App from "./App";

const apiMocks = vi.hoisted(() => ({
  useCreateTopicMutation: vi.fn(),
  useListTopicsQuery: vi.fn()
}));

vi.mock("@/api", () => {
  return {
    useCreateTopicMutation: apiMocks.useCreateTopicMutation,
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

const createdTopic = {
  ...topic,
  id: "topic-created",
  title: "New topic",
  framingQuestion: "What changed?",
  scopeNote: undefined,
  reviewCadence: "ad_hoc"
} as const satisfies Topic;

type ListTopicsHookResult = {
  data?: { topics: Topic[] };
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};

type CreateTopicHookResult = [
  (request: unknown) => { unwrap: () => Promise<unknown> },
  { errorMessage?: string; isLoading: boolean }
];

describe("App", () => {
  const createTopic = vi.fn();
  const unwrapCreateTopic = vi.fn();

  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    createTopic.mockReset();
    unwrapCreateTopic.mockReset();
    apiMocks.useCreateTopicMutation.mockReset();
    apiMocks.useListTopicsQuery.mockReset();
    mockCreateTopicMutation();
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
      await screen.findByRole("heading", { level: 1, name: "Topic Details" })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/topics/topic-created");
    expect(screen.getByText("Topic ID: topic-created")).toBeInTheDocument();
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
        ] satisfies CreateTopicHookResult;
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
