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
  CreateAssessmentUpdateRequest,
  CreateAssessmentUpdateResponse
} from "@repo/signal-tracker-shared";

import { getApiErrorMessage } from "@/api/apiError";
import { evidenceRecord } from "@/api/apiTestData";

import { AssessmentUpdateComposer } from "./AssessmentUpdateComposer";

const apiMocks = vi.hoisted(() => ({
  useCaptureEvidenceUrlMutation: vi.fn(),
  useCreateAssessmentUpdateMutation: vi.fn()
}));

vi.mock("@/api", () => ({
  useCaptureEvidenceUrlMutation: apiMocks.useCaptureEvidenceUrlMutation,
  useCreateAssessmentUpdateMutation: apiMocks.useCreateAssessmentUpdateMutation
}));

type MutationHookResult<TResult> = [
  (request: unknown) => { unwrap: () => Promise<TResult> },
  { errorMessage?: string; isLoading: boolean }
];

function ComposerHarness({
  hasCurrentAssessment = false,
  initialOpen = false
}: {
  hasCurrentAssessment?: boolean;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <>
      <button onClick={() => setOpen(true)} type="button">
        Open composer
      </button>
      <AssessmentUpdateComposer
        hasCurrentAssessment={hasCurrentAssessment}
        onOpenChange={setOpen}
        open={open}
        topicId="topic-1"
      />
    </>
  );
}

describe("AssessmentUpdateComposer", () => {
  const createAssessmentUpdate = vi.fn();
  const unwrapCreateAssessmentUpdate = vi.fn();

  beforeEach(() => {
    createAssessmentUpdate.mockReset();
    unwrapCreateAssessmentUpdate.mockReset();
    apiMocks.useCaptureEvidenceUrlMutation.mockReset();
    mockCaptureEvidenceUrlMutation();
    mockCreateAssessmentUpdateMutation();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders closed until opened", async () => {
    render(<ComposerHarness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open composer" }));

    expect(
      await screen.findByRole("dialog", { name: "Add assessment" })
    ).toBeInTheDocument();
  });

  it("shows update copy when a current assessment exists", async () => {
    render(<ComposerHarness hasCurrentAssessment />);

    fireEvent.click(screen.getByRole("button", { name: "Open composer" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Update assessment"
    });

    expect(
      within(dialog).getByRole("button", { name: "Update assessment" })
    ).toBeInTheDocument();
  });

  it("renders the entry source URL capture field", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    expect(
      within(dialog).getByRole("heading", { name: "Sources" })
    ).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Add source URL")).toBeInTheDocument();
  });

  it("validates required fields before submitting", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fireEvent.change(within(dialog).getByLabelText("Assessment date"), {
      target: { value: "" }
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    expect(
      await within(dialog).findByText("Enter an assessment judgment.")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Choose a valid confidence label.")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Choose an assessment date.")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Enter at least one assumption.")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Enter at least one indicator.")
    ).toBeInTheDocument();
    expect(createAssessmentUpdate).not.toHaveBeenCalled();
  });

  it("validates optional probability before submitting", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fillRequiredFields(dialog);
    fireEvent.change(within(dialog).getByLabelText("Probability"), {
      target: { value: "35.5" }
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    expect(
      await within(dialog).findByText(
        "Enter a whole-number probability from 0 to 100."
      )
    ).toBeInTheDocument();
    expect(createAssessmentUpdate).not.toHaveBeenCalled();
  });

  it("submits trimmed fields through the assessment update contract", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fillRequiredFields(dialog);
    fireEvent.change(within(dialog).getByLabelText("Probability"), {
      target: { value: "35" }
    });
    fireEvent.change(within(dialog).getByLabelText("Resolution criteria"), {
      target: { value: " Direct military action occurs. " }
    });
    fireEvent.change(within(dialog).getByLabelText("Target resolution date"), {
      target: { value: "2026-05-25" }
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    await waitFor(() => {
      expect(createAssessmentUpdate).toHaveBeenCalledWith({
        topicId: "topic-1",
        judgment: "Escalation risk remains limited.",
        confidenceLabel: "medium",
        probabilityPct: 35,
        assumptions: ["Diplomatic channels remain open", "No direct strike"],
        indicators: ["Watch for evacuation orders"],
        resolutionCriteria: "Direct military action occurs.",
        targetResolvesAt: "2026-05-25T00:00:00.000Z",
        sortAt: "2026-04-25T00:00:00.000Z"
      });
    });
  });

  it("submits captured source URLs through the assessment update contract", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fillRequiredFields(dialog);
    fireEvent.paste(within(dialog).getByLabelText("Add source URL"), {
      clipboardData: {
        getData: () => "https://agency.example/report"
      }
    });
    expect(await within(dialog).findByText("Evidence")).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    await waitFor(() => {
      expect(createAssessmentUpdate).toHaveBeenCalledWith({
        topicId: "topic-1",
        judgment: "Escalation risk remains limited.",
        confidenceLabel: "medium",
        assumptions: ["Diplomatic channels remain open", "No direct strike"],
        indicators: ["Watch for evacuation orders"],
        sortAt: "2026-04-25T00:00:00.000Z",
        sources: [{ url: "https://agency.example/report" }]
      });
    });
  });

  it("omits optional fields when they are left blank", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fillRequiredFields(dialog);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    await waitFor(() => {
      const request = createAssessmentUpdate.mock.calls[0]?.[0] as
        | CreateAssessmentUpdateRequest
        | undefined;

      expect(request).toMatchObject({
        topicId: "topic-1",
        judgment: "Escalation risk remains limited.",
        confidenceLabel: "medium",
        assumptions: ["Diplomatic channels remain open", "No direct strike"],
        indicators: ["Watch for evacuation orders"],
        sortAt: "2026-04-25T00:00:00.000Z"
      });
      expect(request).not.toHaveProperty("probabilityPct");
      expect(request).not.toHaveProperty("resolutionCriteria");
      expect(request).not.toHaveProperty("targetResolvesAt");
      expect(request).not.toHaveProperty("title");
    });
  });

  it("keeps entered text visible after an API failure", async () => {
    unwrapCreateAssessmentUpdate.mockRejectedValueOnce({
      status: 503,
      data: {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Assessment save is temporarily unavailable."
        }
      }
    });
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fillRequiredFields(dialog);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Assessment save is temporarily unavailable."
    );
    expect(within(dialog).getByLabelText("Judgment")).toHaveValue(
      " Escalation risk remains limited. "
    );
    expect(within(dialog).getByLabelText("Assessment date")).toHaveValue(
      "2026-04-25"
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes and resets after a successful submit", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fillRequiredFields(dialog);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Open composer" }));
    const reopenedDialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    expect(within(reopenedDialog).getByLabelText("Judgment")).toHaveValue("");
  });

  it("prevents duplicate submissions while saving", async () => {
    let resolveSubmit: (value: CreateAssessmentUpdateResponse) => void = () =>
      undefined;
    unwrapCreateAssessmentUpdate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      })
    );
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", {
      name: "Add assessment"
    });

    fillRequiredFields(dialog);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save assessment" })
    );

    expect(
      await within(dialog).findByRole("button", {
        name: "Saving assessment..."
      })
    ).toBeDisabled();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Saving assessment..." })
    );

    expect(createAssessmentUpdate).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit({} as CreateAssessmentUpdateResponse);
    });
  });

  function mockCreateAssessmentUpdateMutation() {
    unwrapCreateAssessmentUpdate.mockResolvedValue(
      {} satisfies Partial<CreateAssessmentUpdateResponse>
    );
    apiMocks.useCreateAssessmentUpdateMutation.mockImplementation(
      function useMockCreateAssessmentUpdateMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function createAssessmentUpdateTrigger(request: unknown) {
          createAssessmentUpdate(request);

          return {
            async unwrap() {
              try {
                return (await unwrapCreateAssessmentUpdate(
                  request
                )) as CreateAssessmentUpdateResponse;
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [
          createAssessmentUpdateTrigger,
          { errorMessage, isLoading: false }
        ] satisfies MutationHookResult<CreateAssessmentUpdateResponse>;
      }
    );
  }

  function mockCaptureEvidenceUrlMutation() {
    apiMocks.useCaptureEvidenceUrlMutation.mockReturnValue([
      () => ({ unwrap: () => Promise.resolve(evidenceRecord) }),
      { errorMessage: undefined, isLoading: false }
    ]);
  }
});

function fillRequiredFields(dialog: HTMLElement) {
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
    target: {
      value: " Diplomatic channels remain open \n \n No direct strike "
    }
  });
  fireEvent.change(within(dialog).getByLabelText("Indicators"), {
    target: { value: " Watch for evacuation orders " }
  });
}
