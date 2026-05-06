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
  CreateEventEntryResponse,
  Entry,
  UpdateEventEntryResponse
} from "@repo/signal-tracker-shared";

import { getApiErrorMessage } from "@/api/apiError";

import { EventEntryComposer } from "./EventEntryComposer";

const apiMocks = vi.hoisted(() => ({
  useCreateEventEntryMutation: vi.fn(),
  useUpdateEventEntryMutation: vi.fn()
}));

vi.mock("@/api", () => ({
  useCreateEventEntryMutation: apiMocks.useCreateEventEntryMutation,
  useUpdateEventEntryMutation: apiMocks.useUpdateEventEntryMutation
}));

const eventEntry = {
  id: "event-entry-1",
  topicId: "topic-1",
  kind: "event",
  epistemicStatus: "reported",
  title: "Ceasefire talks resume",
  bodyMd: "Delegations reopened indirect talks.",
  sortAt: "2026-05-02T00:00:00.000Z",
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: "2026-05-02T00:00:00.000Z",
  updatedAt: "2026-05-02T00:00:00.000Z"
} as const satisfies Entry;

type MutationHookResult<TResult> = [
  (request: unknown) => { unwrap: () => Promise<TResult> },
  { errorMessage?: string; isLoading: boolean }
];

function ComposerHarness({
  entry = null,
  initialOpen = false
}: {
  entry?: Entry | null;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(entry);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setEditingEntry(null);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setEditingEntry(null);
          setOpen(true);
        }}
        type="button"
      >
        Open create
      </button>
      <button
        onClick={() => {
          setEditingEntry(eventEntry);
          setOpen(true);
        }}
        type="button"
      >
        Open edit
      </button>
      <EventEntryComposer
        entry={editingEntry}
        onOpenChange={handleOpenChange}
        open={open}
        topicId="topic-1"
      />
    </>
  );
}

describe("EventEntryComposer", () => {
  const createEventEntry = vi.fn();
  const updateEventEntry = vi.fn();
  const unwrapCreateEventEntry = vi.fn();
  const unwrapUpdateEventEntry = vi.fn();

  beforeEach(() => {
    createEventEntry.mockReset();
    updateEventEntry.mockReset();
    unwrapCreateEventEntry.mockReset();
    unwrapUpdateEventEntry.mockReset();
    apiMocks.useCreateEventEntryMutation.mockReset();
    apiMocks.useUpdateEventEntryMutation.mockReset();
    mockCreateEventEntryMutation();
    mockUpdateEventEntryMutation();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders closed until opened", async () => {
    render(<ComposerHarness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open create" }));

    expect(
      await screen.findByRole("dialog", { name: "Add event" })
    ).toBeInTheDocument();
  });

  it("shows edit copy and pre-fills existing event fields", async () => {
    render(<ComposerHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Open edit" }));

    const dialog = await screen.findByRole("dialog", { name: "Edit event" });

    expect(within(dialog).getByLabelText("Title")).toHaveValue(
      "Ceasefire talks resume"
    );
    expect(within(dialog).getByLabelText("Details")).toHaveValue(
      "Delegations reopened indirect talks."
    );
    expect(within(dialog).getByLabelText("Event date")).toHaveValue(
      "2026-05-02"
    );
    expect(within(dialog).getByLabelText("Epistemic status")).toHaveValue(
      "reported"
    );
    expect(
      within(dialog).getByRole("button", { name: "Save event" })
    ).toBeInTheDocument();
  });

  it("validates required fields before submitting", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", { name: "Add event" });

    fireEvent.change(within(dialog).getByLabelText("Event date"), {
      target: { value: "" }
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add event" }));

    expect(
      await within(dialog).findByText("Enter an event title.")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Enter event details.")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Choose an event date.")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Choose a valid epistemic status.")
    ).toBeInTheDocument();
    expect(createEventEntry).not.toHaveBeenCalled();
    expect(updateEventEntry).not.toHaveBeenCalled();
  });

  it("submits create requests through the event entry contract", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", { name: "Add event" });

    fillEventForm(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Add event" }));

    await waitFor(() => {
      expect(createEventEntry).toHaveBeenCalledWith({
        topicId: "topic-1",
        title: "Court grants injunction",
        bodyMd: "The court temporarily blocked the rule.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed"
      });
    });
    expect(updateEventEntry).not.toHaveBeenCalled();
  });

  it("submits edit requests through the event entry update contract", async () => {
    render(<ComposerHarness entry={eventEntry} initialOpen />);
    const dialog = await screen.findByRole("dialog", { name: "Edit event" });

    fillEventForm(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Save event" }));

    await waitFor(() => {
      expect(updateEventEntry).toHaveBeenCalledWith({
        entryId: "event-entry-1",
        title: "Court grants injunction",
        bodyMd: "The court temporarily blocked the rule.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed"
      });
    });
    expect(createEventEntry).not.toHaveBeenCalled();
  });

  it("keeps entered text visible after an API failure", async () => {
    unwrapCreateEventEntry.mockRejectedValueOnce({
      status: 503,
      data: {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Event save is temporarily unavailable."
        }
      }
    });
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", { name: "Add event" });

    fillEventForm(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Add event" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Event save is temporarily unavailable."
    );
    expect(within(dialog).getByLabelText("Title")).toHaveValue(
      " Court grants injunction "
    );
    expect(within(dialog).getByLabelText("Details")).toHaveValue(
      " The court temporarily blocked the rule. "
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes and resets after a successful create", async () => {
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", { name: "Add event" });

    fillEventForm(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Add event" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Open create" }));
    const reopenedDialog = await screen.findByRole("dialog", {
      name: "Add event"
    });

    expect(within(reopenedDialog).getByLabelText("Title")).toHaveValue("");
    expect(within(reopenedDialog).getByLabelText("Details")).toHaveValue("");
  });

  it("prevents duplicate submissions while saving", async () => {
    let resolveSubmit: (value: CreateEventEntryResponse) => void = () =>
      undefined;
    unwrapCreateEventEntry.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      })
    );
    render(<ComposerHarness initialOpen />);
    const dialog = await screen.findByRole("dialog", { name: "Add event" });

    fillEventForm(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Add event" }));

    expect(
      await within(dialog).findByRole("button", { name: "Adding event..." })
    ).toBeDisabled();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Adding event..." })
    );

    expect(createEventEntry).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit({ entry: eventEntry });
    });
  });

  function mockCreateEventEntryMutation() {
    unwrapCreateEventEntry.mockResolvedValue({
      entry: eventEntry
    } satisfies CreateEventEntryResponse);
    apiMocks.useCreateEventEntryMutation.mockImplementation(
      function useMockCreateEventEntryMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function createEventEntryTrigger(request: unknown) {
          createEventEntry(request);

          return {
            async unwrap() {
              try {
                return (await unwrapCreateEventEntry(
                  request
                )) as CreateEventEntryResponse;
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [
          createEventEntryTrigger,
          { errorMessage, isLoading: false }
        ] satisfies MutationHookResult<CreateEventEntryResponse>;
      }
    );
  }

  function mockUpdateEventEntryMutation() {
    unwrapUpdateEventEntry.mockResolvedValue({
      entry: eventEntry
    } satisfies UpdateEventEntryResponse);
    apiMocks.useUpdateEventEntryMutation.mockImplementation(
      function useMockUpdateEventEntryMutation() {
        const [errorMessage, setErrorMessage] = useState<string>();

        function updateEventEntryTrigger(request: unknown) {
          updateEventEntry(request);

          return {
            async unwrap() {
              try {
                return (await unwrapUpdateEventEntry(
                  request
                )) as UpdateEventEntryResponse;
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error));
                throw error;
              }
            }
          };
        }

        return [
          updateEventEntryTrigger,
          { errorMessage, isLoading: false }
        ] satisfies MutationHookResult<UpdateEventEntryResponse>;
      }
    );
  }
});

function fillEventForm(dialog: HTMLElement) {
  fireEvent.change(within(dialog).getByLabelText("Title"), {
    target: { value: " Court grants injunction " }
  });
  fireEvent.change(within(dialog).getByLabelText("Details"), {
    target: { value: " The court temporarily blocked the rule. " }
  });
  fireEvent.change(within(dialog).getByLabelText("Event date"), {
    target: { value: "2026-04-25" }
  });
  fireEvent.change(within(dialog).getByLabelText("Epistemic status"), {
    target: { value: "observed" }
  });
}
