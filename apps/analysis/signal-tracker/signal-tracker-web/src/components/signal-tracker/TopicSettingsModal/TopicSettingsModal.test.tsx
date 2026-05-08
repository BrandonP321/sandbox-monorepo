import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate
}));

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
});
