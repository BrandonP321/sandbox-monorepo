import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signalTrackerProtectedDemoTopicId } from "@repo/signal-tracker-shared";
import { topic as topicFixture } from "@/api/apiTestData";

import { TopicSettingsModal } from "./TopicSettingsModal";

const apiMocks = vi.hoisted(() => ({
  useArchiveTopicMutation: vi.fn(),
  useDeleteTopicMutation: vi.fn(),
  useGetTopicQuery: vi.fn(),
  useUpdateTopicMutation: vi.fn()
}));

const navigate = vi.hoisted(() => vi.fn());

vi.mock("@/api", () => ({
  useArchiveTopicMutation: apiMocks.useArchiveTopicMutation,
  useDeleteTopicMutation: apiMocks.useDeleteTopicMutation,
  useGetTopicQuery: apiMocks.useGetTopicQuery,
  useUpdateTopicMutation: apiMocks.useUpdateTopicMutation
}));

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
    "@tanstack/react-router"
  );

  return {
    ...actual,
    useNavigate: () => navigate
  };
});

describe("TopicSettingsModal", () => {
  beforeEach(() => {
    navigate.mockReset();
    apiMocks.useArchiveTopicMutation.mockReset();
    apiMocks.useDeleteTopicMutation.mockReset();
    apiMocks.useGetTopicQuery.mockReset();
    apiMocks.useUpdateTopicMutation.mockReset();

    apiMocks.useArchiveTopicMutation.mockReturnValue([
      vi.fn(),
      { errorMessage: undefined }
    ]);
    apiMocks.useDeleteTopicMutation.mockReturnValue([
      vi.fn(),
      { errorMessage: undefined }
    ]);
    apiMocks.useUpdateTopicMutation.mockReturnValue([
      vi.fn(),
      { errorMessage: undefined }
    ]);
  });

  it("renders settings from the provided topic without refetching it", async () => {
    const topic = {
      ...topicFixture,
      framingQuestion: "What would change the assessment?",
      scopeNote: "Track public signals and official filings.",
      title: "Provided topic"
    };

    render(<TopicSettingsModal topic={topic} />);

    fireEvent.click(screen.getByRole("button", { name: "Topic settings" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Topic settings"
    });

    expect(apiMocks.useGetTopicQuery).not.toHaveBeenCalled();
    expect(within(dialog).getByLabelText("Title")).toHaveValue(
      "Provided topic"
    );
    expect(within(dialog).getByLabelText("Framing question")).toHaveValue(
      "What would change the assessment?"
    );
    expect(within(dialog).getByLabelText("Scope note")).toHaveValue(
      "Track public signals and official filings."
    );
    expect(
      within(dialog).getByRole("button", { name: "Delete topic" })
    ).toBeInTheDocument();
  });

  it("disables lifecycle actions for the protected demo topic", async () => {
    render(
      <TopicSettingsModal
        topic={{
          ...topicFixture,
          id: signalTrackerProtectedDemoTopicId
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Topic settings" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Topic settings"
    });
    const archiveButton = within(dialog).getByRole("button", {
      name: "Archive topic"
    });
    const deleteButton = within(dialog).getByRole("button", {
      name: "Delete topic"
    });

    expect(archiveButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
    expect(
      within(dialog).getByText(
        "Archiving is temporarily disabled for this demo topic."
      )
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Deletion is temporarily disabled for this demo topic."
      )
    ).toBeInTheDocument();

    fireEvent.click(archiveButton);
    fireEvent.click(deleteButton);

    expect(apiMocks.useArchiveTopicMutation).not.toHaveBeenCalled();
    expect(apiMocks.useDeleteTopicMutation).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("alertdialog", {
        name: "Delete topic permanently?"
      })
    ).not.toBeInTheDocument();
  });
});
