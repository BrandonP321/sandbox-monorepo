import type { CreateTopicResponse } from "@repo/signal-tracker-shared";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import App from "./App";
import { createTopic } from "./api/topics";
import { fetchHealthStatus } from "./health";

vi.mock("./health", async () => {
  const actual = await vi.importActual<typeof import("./health")>("./health");

  return {
    ...actual,
    fetchHealthStatus: vi.fn()
  };
});

vi.mock("./api/topics", async () => {
  const actual = await vi.importActual<typeof import("./api/topics")>(
    "./api/topics"
  );

  return {
    ...actual,
    createTopic: vi.fn()
  };
});

const createdTopicResponse: CreateTopicResponse = {
  topic: {
    id: "topic-1",
    title: "Iran strike risk",
    framingQuestion: "Will tensions escalate?",
    scopeNote: "Track official signals and credible reporting.",
    status: "active",
    reviewCadence: "weekly",
    createdAt: "2026-04-26T00:00:00.000Z",
    updatedAt: "2026-04-26T00:00:00.000Z"
  }
};

afterEach(() => {
  vi.clearAllMocks();
});

const fetchHealthStatusMock = vi.mocked(fetchHealthStatus);
const createTopicMock = vi.mocked(createTopic);

describe("App", () => {
  beforeEach(() => {
    fetchHealthStatusMock.mockResolvedValue({ ok: true });
    createTopicMock.mockResolvedValue(createdTopicResponse);
  });

  it("renders the loading state while the health check is in flight", () => {
    fetchHealthStatusMock.mockReturnValue(new Promise(() => undefined));

    render(<App />);

    expect(screen.getByText("Signal Tracker")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Checking the API scaffold..."
    );
  });

  it("renders the healthy backend state", async () => {
    render(<App />);

    expect(
      await screen.findByText("API scaffold ready: healthy.")
    ).toBeInTheDocument();
  });

  it("renders the topic creation form without placeholder module copy", async () => {
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
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Create topic" }));

    expect(await screen.findByText("Enter a topic title.")).toBeInTheDocument();
    expect(screen.getByText("Enter a framing question.")).toBeInTheDocument();
    expect(createTopicMock).not.toHaveBeenCalled();
  });

  it("submits a parsed topic request and shows the created topic summary", async () => {
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

    expect(await screen.findByText("Iran strike risk")).toBeInTheDocument();
    expect(screen.getByText("Will tensions escalate?")).toBeInTheDocument();
    expect(screen.getAllByText("Weekly")).toHaveLength(2);
    expect(screen.getByText("topic-1")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("");
  });

  it("omits a blank scope note through the shared schema", async () => {
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

  it("shows a final request error with a retry affordance", async () => {
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

  it("renders an error message when the health check fails", async () => {
    fetchHealthStatusMock.mockRejectedValue(new Error("network"));

    render(<App />);

    expect(
      await screen.findByText("API scaffold unavailable.")
    ).toBeInTheDocument();
  });
});
