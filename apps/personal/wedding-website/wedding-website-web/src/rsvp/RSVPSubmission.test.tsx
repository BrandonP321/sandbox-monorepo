import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import { createInitialDraft, updateAdult } from "./rsvpDraft";
import {
  PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_VERSION
} from "./prototypeStorage";
import type { RsvpDraft, UnresolvedRsvpAttemptV1 } from "./rsvpTypes";

function createValidDraft(): RsvpDraft {
  let draft = createInitialDraft();
  draft = {
    ...draft,
    guestSide: "niamh",
    contact: { email: "party@example.test", phone: "" },
    generalNote: "Synthetic browser test"
  };
  return updateAdult(draft, "adult-1", (adult) => ({
    ...adult,
    name: "Alex Example",
    attendance: "attending",
    contact: { email: "adult@example.test", phone: "" }
  }));
}

function createSuccessResponse(status: 200 | 201 = 201): Response {
  return new Response(
    JSON.stringify({
      submissionId: "4c338adc-ff18-4d44-8062-d425903472fb",
      submittedAt: "2026-08-26T01:35:31.468Z",
      schemaVersion: 1
    }),
    { status }
  );
}

function storeReview(
  unresolvedAttempt: UnresolvedRsvpAttemptV1 | null = null,
  draft = createValidDraft()
) {
  window.localStorage.setItem(
    PROTOTYPE_STORAGE_KEY,
    JSON.stringify({
      version: PROTOTYPE_STORAGE_VERSION,
      state: { currentStage: "review", draft },
      unresolvedAttempt
    })
  );
}

function renderReview() {
  window.history.replaceState(null, "", "/RSVP");
  return render(<App />);
}

function getAttemptKeyFromFetchCall(
  fetcher: ReturnType<typeof vi.fn>,
  index: number
) {
  const init = fetcher.mock.calls[index]?.[1] as RequestInit | undefined;
  return new Headers(init?.headers).get("idempotency-key");
}

function readStoredAttempt(): UnresolvedRsvpAttemptV1 | null {
  const rawValue = window.localStorage.getItem(PROTOTYPE_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }
  return JSON.parse(rawValue).unresolvedAttempt ?? null;
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("production RSVP submission behavior", () => {
  it("persists the attempt before fetch, exposes one in-flight request, and confirms after 201", async () => {
    let finishRequest: ((response: Response) => void) | undefined;
    let snapshotAtFetch: string | null = null;
    const fetcher = vi.fn(() => {
      snapshotAtFetch = window.localStorage.getItem(PROTOTYPE_STORAGE_KEY);
      return new Promise<Response>((resolve) => {
        finishRequest = resolve;
      });
    });
    vi.stubGlobal("fetch", fetcher);
    storeReview();
    renderReview();

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    const submittingButton = await screen.findByRole("button", {
      name: "Submitting…"
    });
    expect(submittingButton).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Submitting your RSVP"
    );
    expect(
      screen.getByRole("button", { name: "Back to details" })
    ).toBeDisabled();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1), {
      timeout: 5_000
    });
    expect(JSON.parse(snapshotAtFetch ?? "{}").unresolvedAttempt).toMatchObject(
      {
        version: 1,
        contractVersion: 1
      }
    );

    fireEvent.submit(submittingButton.closest("form")!);
    expect(fetcher).toHaveBeenCalledTimes(1);

    finishRequest?.(createSuccessResponse());

    expect(
      await screen.findByRole("heading", {
        name: "Thank you—your RSVP is complete."
      })
    ).toBeVisible();
    expect(window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)).toBeNull();
  });

  it("reuses the unresolved key after a network failure and page refresh", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(createSuccessResponse(200));
    vi.stubGlobal("fetch", fetcher);
    storeReview();
    const firstView = renderReview();

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1), {
      timeout: 5_000
    });
    expect(
      await screen.findByText(
        "Your RSVP is not confirmed yet. Please try submitting again. If you continue to have trouble, please reach out to us directly and we’ll make sure your RSVP gets recorded."
      )
    ).toBeVisible();
    const firstAttemptKey = getAttemptKeyFromFetchCall(fetcher, 0);
    expect(readStoredAttempt()?.idempotencyKey).toBe(firstAttemptKey);

    firstView.unmount();
    renderReview();
    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    expect(
      await screen.findByRole("heading", {
        name: "Thank you—your RSVP is complete."
      })
    ).toBeVisible();
    expect(getAttemptKeyFromFetchCall(fetcher, 1)).toBe(firstAttemptKey);
  });

  it.each([429, 500, 503])(
    "retains the unresolved attempt and shows the save failure copy after HTTP %s",
    async (status) => {
      const fetcher = vi.fn(async () => new Response("{}", { status }));
      vi.stubGlobal("fetch", fetcher);
      storeReview();
      renderReview();

      fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("We couldn't confirm your RSVP");
      expect(alert).toHaveTextContent(
        "Your RSVP is not confirmed yet. Please try submitting again. If you continue to have trouble, please reach out to us directly and we’ll make sure your RSVP gets recorded."
      );
      expect(readStoredAttempt()?.idempotencyKey).toBe(
        getAttemptKeyFromFetchCall(fetcher, 0)
      );
      expect(
        screen.queryByRole("heading", {
          name: "Thank you—your RSVP is complete."
        })
      ).toBeNull();
    }
  );

  it("retains the attempt when a 201 response is malformed", async () => {
    const fetcher = vi.fn(async () => new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetcher);
    storeReview();
    renderReview();

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    expect(
      await screen.findByText(
        "Your RSVP is not confirmed yet. Please try submitting again. If you continue to have trouble, please reach out to us directly and we’ll make sure your RSVP gets recorded."
      )
    ).toBeVisible();
    expect(readStoredAttempt()?.idempotencyKey).toBe(
      getAttemptKeyFromFetchCall(fetcher, 0)
    );
  });

  it.each([400, 413])(
    "keeps the draft editable and clears the attempt after HTTP %s",
    async (status) => {
      const fetcher = vi.fn(async () => new Response("{}", { status }));
      vi.stubGlobal("fetch", fetcher);
      storeReview();
      renderReview();

      fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

      expect(await screen.findByText("Please review your RSVP")).toBeVisible();
      expect(readStoredAttempt()).toBeNull();
      expect(
        screen.getByRole("button", { name: "Edit party & attendance" })
      ).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Edit additional details" })
      ).toBeVisible();
    }
  );

  it("clears a conflicting key and creates a fresh key on retry", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 409 }))
      .mockResolvedValueOnce(createSuccessResponse());
    vi.stubGlobal("fetch", fetcher);
    storeReview();
    renderReview();

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));
    expect(
      await screen.findByText("We couldn't safely retry this RSVP")
    ).toBeVisible();
    expect(readStoredAttempt()).toBeNull();
    const conflictingKey = getAttemptKeyFromFetchCall(fetcher, 0);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", {
        name: "Thank you—your RSVP is complete."
      })
    ).toBeVisible();
    expect(getAttemptKeyFromFetchCall(fetcher, 1)).not.toBe(conflictingKey);
  });

  it("blocks fetch when the attempt cannot be durably stored", async () => {
    const fetcher = vi.fn(async () => createSuccessResponse());
    vi.stubGlobal("fetch", fetcher);
    storeReview();
    renderReview();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    expect(
      await screen.findByText("We couldn't prepare your RSVP")
    ).toBeVisible();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("uses shared boundary validation before fetch", async () => {
    const fetcher = vi.fn(async () => createSuccessResponse());
    vi.stubGlobal("fetch", fetcher);
    const invalidDraft = createValidDraft();
    invalidDraft.adults[0]!.name = "x".repeat(101);
    storeReview(null, invalidDraft);
    renderReview();

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    expect(await screen.findByText("Please review your RSVP")).toBeVisible();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
