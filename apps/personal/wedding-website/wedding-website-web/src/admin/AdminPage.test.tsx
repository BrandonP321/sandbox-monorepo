import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminPage } from "./AdminPage";

const accessKey = "synthetic-admin-access-key";

const submissions = [
  {
    submissionId: "a7b606b8-e5d0-40a7-a023-f3597f1b1aa9",
    submittedAt: "2026-08-26T02:35:31.000Z",
    schemaVersion: 1,
    guestSide: "brandon",
    adults: [
      {
        name: "Synthetic Newer Guest",
        attendance: "not-sure",
        contact: { email: "newer@example.test" }
      }
    ],
    childrenAttending: 2,
    contact: { phone: "+1 202 555 0184" },
    dietaryOrAllergyNotes: "Synthetic dietary note",
    accessibilityNotes: "Synthetic access note",
    generalNote: "Synthetic general note"
  },
  {
    submissionId: "3bb32b27-c576-4c70-8078-1285efcc908c",
    submittedAt: "2026-08-26T01:35:31.000Z",
    schemaVersion: 1,
    guestSide: "niamh",
    adults: [
      {
        name: "Synthetic Older Guest",
        attendance: "unable",
        contact: { phone: "+353 87 123 4567" }
      }
    ],
    childrenAttending: 0,
    contact: { email: "older-party@example.test" }
  }
];

function response(status = 200) {
  return new Response(JSON.stringify({ submissions }), { status });
}

function enterAccessKey() {
  fireEvent.change(screen.getByLabelText("Admin access key"), {
    target: { value: accessKey }
  });
  fireEvent.click(screen.getByRole("button", { name: "View RSVPs" }));
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("AdminPage", () => {
  it("renders the access form and keeps the access key out of localStorage", async () => {
    const fetcher = vi.fn(async () => response());
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(
      <AdminPage apiBaseUrl="https://api.example.test" fetcher={fetcher} />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "RSVP Admin" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Admin access key")).toHaveAttribute(
      "type",
      "password"
    );

    enterAccessKey();

    await screen.findByRole("heading", { name: "Submitted RSVPs" });
    expect(JSON.stringify(setItem.mock.calls)).not.toContain(accessKey);
  });

  it("does not reveal RSVP data after a 401", async () => {
    render(
      <AdminPage
        apiBaseUrl="https://api.example.test"
        fetcher={vi.fn(async () => response(401))}
      />
    );

    enterAccessKey();

    expect(await screen.findByRole("alert")).toHaveTextContent("Access denied");
    expect(screen.queryByText("Synthetic Newer Guest")).not.toBeInTheDocument();
  });

  it("renders multiple submissions and all useful supplied fields newest first", async () => {
    render(
      <AdminPage
        apiBaseUrl="https://api.example.test"
        fetcher={vi.fn(async () => response())}
      />
    );

    enterAccessKey();

    expect(await screen.findByText("2 submissions")).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Synthetic Newer Guest");
    expect(cards[1]).toHaveTextContent("Synthetic Older Guest");
    for (const value of [
      "Brandon's side",
      "Not sure yet",
      "newer@example.test",
      "+1 202 555 0184",
      "2",
      "Synthetic dietary note",
      "Synthetic access note",
      "Synthetic general note",
      submissions[0].submissionId
    ]) {
      expect(cards[0]).toHaveTextContent(value);
    }
  });

  it("announces loading and retryable failures accessibly", async () => {
    let rejectRequest: ((reason?: unknown) => void) | undefined;
    const fetcher = vi.fn(
      async () =>
        new Promise<Response>((_resolve, reject) => {
          rejectRequest = reject;
        })
    );
    render(
      <AdminPage apiBaseUrl="https://api.example.test" fetcher={fetcher} />
    );

    enterAccessKey();
    expect(screen.getByRole("status")).toHaveTextContent("Loading RSVPs");
    rejectRequest?.(new TypeError("network failure"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load RSVPs"
    );
  });

  it("refreshes with the in-memory key and logout clears the key and records", async () => {
    const fetcher = vi.fn(async () => response());
    render(
      <AdminPage apiBaseUrl="https://api.example.test" fetcher={fetcher} />
    );
    enterAccessKey();

    await screen.findByText("Synthetic Newer Guest");
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    await screen.findByText("Synthetic Newer Guest");
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(screen.queryByText("Synthetic Newer Guest")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Admin access key")).toHaveValue("");
  });
});
