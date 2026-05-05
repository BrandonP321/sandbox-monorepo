import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AssessmentUpdate } from "@repo/signal-tracker-shared";

import { CurrentAssessmentPanel } from "./CurrentAssessmentPanel";

const assessment = {
  entry: {
    id: "assessment-entry-1",
    topicId: "topic-1",
    kind: "assessment",
    epistemicStatus: "inferred",
    title: "Escalation risk assessment",
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
  assumptions: [
    "Backchannel talks remain active.",
    "Military posture changes are signaling, not preparation.",
    "Regional allies continue pressing for restraint."
  ],
  indicators: [
    "Watch for evacuation orders.",
    "Watch for carrier movement.",
    "Watch for emergency legislative briefings."
  ],
  resolutionCriteria: "Direct strike occurs.",
  targetResolvesAt: "2026-06-01T00:00:00.000Z",
  previousAssessmentEntryId: undefined
} satisfies AssessmentUpdate;

describe("CurrentAssessmentPanel", () => {
  it("renders an empty state when no assessment exists", () => {
    render(<CurrentAssessmentPanel assessment={null} />);

    expect(
      screen.getByRole("heading", { name: "Current assessment" })
    ).toBeInTheDocument();
    expect(screen.getByText("No assessment yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add assessment" })
    ).toBeDisabled();
  });

  it("renders populated assessment details compactly", () => {
    render(<CurrentAssessmentPanel assessment={assessment} />);

    const currentAssessment = screen.getByRole("article", {
      name: "Current assessment"
    });

    expect(
      within(currentAssessment).getByText(
        "Risk is rising but still constrained by diplomatic incentives."
      )
    ).toBeInTheDocument();
    expect(within(currentAssessment).getByText("Medium")).toBeInTheDocument();
    expect(
      within(currentAssessment).getByText("55% probability")
    ).toBeInTheDocument();
    expect(within(currentAssessment).getByText("May 1, 2026")).toHaveAttribute(
      "datetime",
      "2026-05-01T00:00:00.000Z"
    );
    expect(
      within(currentAssessment).getByText("Backchannel talks remain active.")
    ).toBeInTheDocument();
    expect(
      within(currentAssessment).getByText("Watch for evacuation orders.")
    ).toBeInTheDocument();
  });

  it("omits probability when the assessment does not include one", () => {
    render(
      <CurrentAssessmentPanel
        assessment={{ ...assessment, probabilityPct: undefined }}
      />
    );

    expect(screen.queryByText("55% probability")).not.toBeInTheDocument();
  });

  it("summarizes assumptions and indicators with a hidden count", () => {
    render(<CurrentAssessmentPanel assessment={assessment} />);

    const assumptions = screen.getByRole("region", { name: "Assumptions" });
    const indicators = screen.getByRole("region", { name: "Indicators" });

    expect(
      within(assumptions).getByText("Backchannel talks remain active.")
    ).toBeInTheDocument();
    expect(
      within(assumptions).getByText(
        "Military posture changes are signaling, not preparation."
      )
    ).toBeInTheDocument();
    expect(
      within(assumptions).queryByText(
        "Regional allies continue pressing for restraint."
      )
    ).not.toBeInTheDocument();
    expect(within(assumptions).getByText("+1 more")).toBeInTheDocument();
    expect(within(indicators).getByText("+1 more")).toBeInTheDocument();
  });

  it("enables the assessment action when a callback is provided", () => {
    const onAssessmentAction = vi.fn();

    render(
      <CurrentAssessmentPanel
        assessment={assessment}
        onAssessmentAction={onAssessmentAction}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Update assessment" }));

    expect(onAssessmentAction).toHaveBeenCalledTimes(1);
  });
});
