import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ListTopicTimelineResponse,
  TopicTimelineItem
} from "@repo/signal-tracker-shared";

import { TopicTimeline } from "./TopicTimeline";

const apiMocks = vi.hoisted(() => ({
  useListTopicTimelineQuery: vi.fn()
}));

vi.mock("@/api", () => ({
  useListTopicTimelineQuery: apiMocks.useListTopicTimelineQuery
}));

type TimelineHookResult = {
  data?: ListTopicTimelineResponse;
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const eventTimelineItem = {
  kind: "event",
  entry: {
    id: "event-entry-1",
    topicId: "topic-1",
    kind: "event",
    epistemicStatus: "reported",
    title: "Ceasefire talks resume",
    bodyMd: "Delegations reopened indirect talks after a week-long pause.",
    sortAt: "2026-05-01T00:00:00.000Z",
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  }
} as const satisfies TopicTimelineItem;

const reviewTimelineItem = {
  kind: "review",
  entry: {
    ...eventTimelineItem.entry,
    id: "review-entry-1",
    kind: "review",
    epistemicStatus: "inferred",
    title: "Weekly review",
    bodyMd: "No major assessment changes.",
    sortAt: "2026-05-02T00:00:00.000Z"
  }
} as const satisfies TopicTimelineItem;

const assessmentTimelineItem = {
  kind: "assessment",
  entry: {
    ...eventTimelineItem.entry,
    id: "assessment-entry-1",
    kind: "assessment",
    epistemicStatus: "forecast",
    title: "Escalation risk assessment",
    bodyMd: "Risk is rising.",
    sortAt: "2026-05-03T00:00:00.000Z"
  },
  assessment: {
    judgment: "Risk is rising but still constrained.",
    confidenceLabel: "medium",
    probabilityPct: 55,
    assumptions: ["Backchannel talks remain active."],
    indicators: ["Watch for evacuation orders."],
    resolutionCriteria: "Direct escalation is confirmed.",
    targetResolvesAt: "2026-06-01T00:00:00.000Z",
    previousAssessmentEntryId: undefined
  }
} as const satisfies TopicTimelineItem;

describe("TopicTimeline", () => {
  beforeEach(() => {
    apiMocks.useListTopicTimelineQuery.mockReset();
    mockTimelineQuery({ data: { items: [] } });
  });

  it("fetches the topic timeline by topic ID", () => {
    render(<TopicTimeline topicId="topic-1" />);

    expect(apiMocks.useListTopicTimelineQuery).toHaveBeenCalledWith({
      topicId: "topic-1"
    });
  });

  it("renders the loading state", () => {
    mockTimelineQuery({ isLoading: true });

    render(<TopicTimeline topicId="topic-1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading timeline");
  });

  it("renders an error state with retry", () => {
    const refetch = vi.fn();
    mockTimelineQuery({
      errorMessage: "Database is waking up.",
      isError: true,
      refetch
    });

    render(<TopicTimeline topicId="topic-1" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Timeline could not be loaded."
    );
    expect(screen.getByText("Database is waking up.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders an empty state when no visible timeline entries exist", () => {
    render(<TopicTimeline topicId="topic-1" />);

    expect(screen.getByText("No timeline entries yet")).toBeInTheDocument();
  });

  it("renders mixed event and assessment rows while hiding reviews", () => {
    mockTimelineQuery({
      data: {
        items: [reviewTimelineItem, assessmentTimelineItem, eventTimelineItem]
      }
    });

    render(<TopicTimeline topicId="topic-1" />);

    expect(
      screen.getByRole("article", { name: "Ceasefire talks resume" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Escalation risk assessment" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Weekly review")).not.toBeInTheDocument();
    expect(screen.getByText("Reported")).toBeInTheDocument();
    expect(screen.getByText("Forecast")).toBeInTheDocument();
    expect(screen.getAllByText("Assessment Update")).toHaveLength(1);
    expect(screen.getAllByText("Medium")).toHaveLength(1);
    expect(screen.getAllByText("55% probability")).toHaveLength(1);
  });

  it("expands and collapses an event row inline", () => {
    mockTimelineQuery({ data: { items: [eventTimelineItem] } });

    render(<TopicTimeline topicId="topic-1" />);

    expect(
      screen.queryByText(
        "Delegations reopened indirect talks after a week-long pause."
      )
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand details for Ceasefire talks resume"
      })
    );

    expect(
      screen.getByText(
        "Delegations reopened indirect talks after a week-long pause."
      )
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Collapse details for Ceasefire talks resume"
      })
    );

    expect(
      screen.queryByText(
        "Delegations reopened indirect talks after a week-long pause."
      )
    ).not.toBeInTheDocument();
  });

  it("keeps multiple entries expanded at the same time", () => {
    mockTimelineQuery({
      data: { items: [eventTimelineItem, assessmentTimelineItem] }
    });

    render(<TopicTimeline topicId="topic-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand details for Ceasefire talks resume"
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand details for Escalation risk assessment"
      })
    );

    expect(
      screen.getByText(
        "Delegations reopened indirect talks after a week-long pause."
      )
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Risk is rising but still constrained.")
    ).toHaveLength(2);
  });

  it("renders assessment-specific expanded fields", () => {
    mockTimelineQuery({ data: { items: [assessmentTimelineItem] } });

    render(<TopicTimeline topicId="topic-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand details for Escalation risk assessment"
      })
    );

    const assumptions = screen.getByRole("region", { name: "Assumptions" });
    const indicators = screen.getByRole("region", { name: "Indicators" });

    expect(
      within(assumptions).getByText("Backchannel talks remain active.")
    ).toBeInTheDocument();
    expect(
      within(indicators).getByText("Watch for evacuation orders.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Direct escalation is confirmed.")
    ).toBeInTheDocument();
    expect(screen.getByText("Jun 1, 2026")).toHaveAttribute(
      "datetime",
      "2026-06-01T00:00:00.000Z"
    );
  });
});

function mockTimelineQuery(overrides: Partial<TimelineHookResult> = {}) {
  const refetch = vi.fn();

  apiMocks.useListTopicTimelineQuery.mockReturnValue({
    data: { items: [] },
    isError: false,
    isLoading: false,
    refetch,
    ...overrides
  } satisfies TimelineHookResult);
}
