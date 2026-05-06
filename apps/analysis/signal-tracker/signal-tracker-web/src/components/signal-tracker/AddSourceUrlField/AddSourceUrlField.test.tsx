import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CaptureEvidenceUrlResponse } from "@repo/signal-tracker-shared";

import {
  evidenceRecord,
  secondEvidenceRecord,
  sparseEvidenceRecord
} from "@/api/apiTestData";

import { AddSourceUrlField } from "./AddSourceUrlField";

const apiMocks = vi.hoisted(() => ({
  useCaptureEvidenceUrlMutation: vi.fn()
}));

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();

  return {
    ...actual,
    useCaptureEvidenceUrlMutation: apiMocks.useCaptureEvidenceUrlMutation
  };
});

describe("AddSourceUrlField", () => {
  const captureEvidenceUrl = vi.fn();
  const unwrapCaptureEvidenceUrl = vi.fn();

  beforeEach(() => {
    captureEvidenceUrl.mockReset();
    unwrapCaptureEvidenceUrl.mockReset();
    unwrapCaptureEvidenceUrl.mockResolvedValue(evidenceRecord);
    apiMocks.useCaptureEvidenceUrlMutation.mockReset();
    apiMocks.useCaptureEvidenceUrlMutation.mockReturnValue([
      (request: unknown) => {
        captureEvidenceUrl(request);

        return {
          unwrap: () => unwrapCaptureEvidenceUrl(request)
        };
      },
      { errorMessage: undefined, isLoading: false }
    ]);
  });

  it("renders the source URL field", () => {
    render(<AddSourceUrlField />);

    expect(
      screen.getByRole("heading", { name: "Sources" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Add source URL")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add source URL" })
    ).toBeInTheDocument();
  });

  it("captures one entered source URL", async () => {
    render(<AddSourceUrlField />);

    fireEvent.change(screen.getByLabelText("Add source URL"), {
      target: { value: " https://agency.example/report " }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add source URL" }));

    await waitFor(() => {
      expect(captureEvidenceUrl).toHaveBeenCalledWith({
        url: "https://agency.example/report"
      });
    });
    expect(await screen.findByText("Evidence")).toBeInTheDocument();
    expect(screen.getByText("Agency")).toBeInTheDocument();
  });

  it("captures multiple URLs from pasted text", async () => {
    unwrapCaptureEvidenceUrl
      .mockResolvedValueOnce(evidenceRecord)
      .mockResolvedValueOnce(secondEvidenceRecord);
    render(<AddSourceUrlField />);

    fireEvent.paste(screen.getByLabelText("Add source URL"), {
      clipboardData: {
        getData: () =>
          "Sources: https://agency.example/report and https://www.reuters.com/world/example."
      }
    });

    await waitFor(() => {
      expect(captureEvidenceUrl).toHaveBeenCalledTimes(2);
    });
    expect(captureEvidenceUrl).toHaveBeenNthCalledWith(1, {
      url: "https://agency.example/report"
    });
    expect(captureEvidenceUrl).toHaveBeenNthCalledWith(2, {
      url: "https://www.reuters.com/world/example"
    });
    expect(await screen.findByText("Evidence")).toBeInTheDocument();
    expect(await screen.findByText("Reuters source")).toBeInTheDocument();
  });

  it("shows validation without calling the API for invalid URLs", () => {
    render(<AddSourceUrlField />);

    fireEvent.change(screen.getByLabelText("Add source URL"), {
      target: { value: "not a url" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add source URL" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid http or https source URL."
    );
    expect(captureEvidenceUrl).not.toHaveBeenCalled();
  });

  it("prevents duplicate source URLs in the local entry context", async () => {
    render(<AddSourceUrlField />);

    fireEvent.paste(screen.getByLabelText("Add source URL"), {
      clipboardData: { getData: () => "https://agency.example/report" }
    });
    await screen.findByText("Evidence");

    fireEvent.paste(screen.getByLabelText("Add source URL"), {
      clipboardData: { getData: () => "https://agency.example/report" }
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "That source URL is already added."
    );
    expect(captureEvidenceUrl).toHaveBeenCalledTimes(1);
  });

  it("renders fallback metadata when captured source data is sparse", async () => {
    unwrapCaptureEvidenceUrl.mockResolvedValueOnce(sparseEvidenceRecord);
    const { container } = render(<AddSourceUrlField />);

    fireEvent.paste(screen.getByLabelText("Add source URL"), {
      clipboardData: { getData: () => "https://sparse.example/source" }
    });

    await waitFor(() => {
      expect(screen.getAllByText("Sparse Source").length).toBeGreaterThan(0);
    });
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses a favicon when available and falls back if the image fails", async () => {
    const { container } = render(<AddSourceUrlField />);

    fireEvent.paste(screen.getByLabelText("Add source URL"), {
      clipboardData: { getData: () => "https://agency.example/report" }
    });

    await screen.findByText("Evidence");
    const favicon = container.querySelector("img");

    expect(favicon).toHaveAttribute(
      "src",
      "https://www.google.com/s2/favicons?domain=agency.example&sz=32"
    );

    fireEvent.error(favicon as HTMLImageElement);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("shows per-URL pending state while capture is in progress", async () => {
    unwrapCaptureEvidenceUrl.mockReturnValueOnce(
      new Promise<CaptureEvidenceUrlResponse>(() => undefined)
    );
    render(<AddSourceUrlField />);

    fireEvent.paste(screen.getByLabelText("Add source URL"), {
      clipboardData: { getData: () => "https://agency.example/report" }
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Capturing source..."
    );
  });

  it("shows failed capture state and supports retry and remove", async () => {
    unwrapCaptureEvidenceUrl
      .mockRejectedValueOnce({
        status: 503,
        data: {
          error: {
            code: "DATABASE_UNAVAILABLE",
            message: "Source capture is temporarily unavailable."
          }
        }
      })
      .mockResolvedValueOnce(evidenceRecord);
    render(<AddSourceUrlField />);

    fireEvent.paste(screen.getByLabelText("Add source URL"), {
      clipboardData: { getData: () => "https://agency.example/report" }
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Source capture is temporarily unavailable."
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Retry source agency.example" })
    );

    await waitFor(() => {
      expect(captureEvidenceUrl).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText("Evidence")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove source Agency" })
    );

    expect(screen.queryByText("Evidence")).not.toBeInTheDocument();
  });

  it("notifies the parent when captured records change", async () => {
    const handleCapturedRecordsChange = vi.fn();
    render(
      <AddSourceUrlField
        onCapturedRecordsChange={handleCapturedRecordsChange}
      />
    );

    fireEvent.paste(screen.getByLabelText("Add source URL"), {
      clipboardData: { getData: () => "https://agency.example/report" }
    });

    await waitFor(() => {
      expect(handleCapturedRecordsChange).toHaveBeenLastCalledWith([
        evidenceRecord
      ]);
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Remove source Agency" })
    );

    await waitFor(() => {
      expect(handleCapturedRecordsChange).toHaveBeenLastCalledWith([]);
    });
  });
});
