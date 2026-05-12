import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateEventEntryResponse,
  UpdateEventEntryResponse
} from "@repo/signal-tracker-shared";

import { getApiErrorMessage } from "@/api/apiError";
import { eventEntryReadModel } from "@/api/apiTestData";
import { useNotifications } from "@/components/ui";

import { EventEntryDialog } from "./EventEntryDialog";

const apiMocks = vi.hoisted(() => ({
  useCreateEventEntryMutation: vi.fn(),
  useUpdateEventEntryMutation: vi.fn()
}));

vi.mock("@/api", () => ({
  useCreateEventEntryMutation: apiMocks.useCreateEventEntryMutation,
  useUpdateEventEntryMutation: apiMocks.useUpdateEventEntryMutation
}));

type MutationHookResult<TResult> = [
  (request: unknown) => { unwrap: () => Promise<TResult> },
  { errorMessage?: string; isLoading: boolean }
];

describe("EventEntryDialog", () => {
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

  it("renders closed until triggered", async () => {
    render(<CreateEventEntryDialog />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open create" }));

    expect(
      await screen.findByRole("dialog", { name: "Add event" })
    ).toBeInTheDocument();
  });

  it("shows edit copy and pre-fills existing event fields", async () => {
    render(<EditEventEntryDialog />);

    fireEvent.click(screen.getByRole("button", { name: "Open edit" }));

    const dialog = await screen.findByRole("dialog", { name: "Edit event" });

    expect(within(dialog).getByLabelText("Title")).toHaveValue("Event 1");
    expect(within(dialog).getByLabelText("Details")).toHaveValue(
      "A reported event."
    );
    expect(within(dialog).getByLabelText("Event date")).toHaveValue(
      "2026-01-02"
    );
    expect(within(dialog).getByLabelText("Epistemic status")).toHaveValue(
      "reported"
    );
    expect(within(dialog).getByLabelText("Source URL 1")).toHaveValue(
      "https://agency.example/report"
    );
    expect(
      within(dialog).getByLabelText("Source preview for agency.example")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Save event" })
    ).toBeInTheDocument();
  });

  it("validates required fields before submitting", async () => {
    render(<CreateEventEntryDialog />);
    const dialog = await openDialog("Open create", "Add event");

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

  it("submits create requests with source URLs", async () => {
    render(<CreateEventEntryDialog />);
    const dialog = await openDialog("Open create", "Add event");

    fillEventForm(dialog);
    addSourceUrl(dialog, "https://agency.example/report");
    fireEvent.click(within(dialog).getByRole("button", { name: "Add event" }));

    await waitFor(() => {
      expect(createEventEntry).toHaveBeenCalledWith({
        topicId: "topic-1",
        title: "Court grants injunction",
        bodyMd: "The court temporarily blocked the rule.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed",
        sources: [{ url: "https://agency.example/report" }]
      });
    });
    expect(updateEventEntry).not.toHaveBeenCalled();
  });

  it("submits edit requests after removing an attached source", async () => {
    render(<EditEventEntryDialog />);
    const dialog = await openDialog("Open edit", "Edit event");

    fillEventForm(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Save event" }));

    await waitFor(() => {
      expect(updateEventEntry).toHaveBeenCalledWith({
        entryId: "entry-1",
        title: "Court grants injunction",
        bodyMd: "The court temporarily blocked the rule.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed",
        sources: []
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
    render(<CreateEventEntryDialog />);
    const dialog = await openDialog("Open create", "Add event");

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
    render(<CreateEventEntryDialog />);
    const dialog = await openDialog("Open create", "Add event");

    fillEventForm(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Add event" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    const reopenedDialog = await openDialog("Open create", "Add event");

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
    render(<CreateEventEntryDialog />);
    const dialog = await openDialog("Open create", "Add event");

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
      resolveSubmit({ entry: eventEntryReadModel });
    });
  });

  function mockCreateEventEntryMutation() {
    unwrapCreateEventEntry.mockResolvedValue({
      entry: eventEntryReadModel
    } satisfies CreateEventEntryResponse);
    apiMocks.useCreateEventEntryMutation.mockImplementation(
      function useMockCreateEventEntryMutation() {
        const { notifyError } = useNotifications();

        function createEventEntryTrigger(request: unknown) {
          createEventEntry(request);

          return {
            async unwrap() {
              try {
                return (await unwrapCreateEventEntry(
                  request
                )) as CreateEventEntryResponse;
              } catch (error) {
                notifyError({
                  content: getApiErrorMessage(error),
                  header: "Unable to add event"
                });
                throw error;
              }
            }
          };
        }

        return [
          createEventEntryTrigger,
          { errorMessage: undefined, isLoading: false }
        ] satisfies MutationHookResult<CreateEventEntryResponse>;
      }
    );
  }

  function mockUpdateEventEntryMutation() {
    unwrapUpdateEventEntry.mockResolvedValue({
      entry: eventEntryReadModel
    } satisfies UpdateEventEntryResponse);
    apiMocks.useUpdateEventEntryMutation.mockImplementation(
      function useMockUpdateEventEntryMutation() {
        const { notifyError } = useNotifications();

        function updateEventEntryTrigger(request: unknown) {
          updateEventEntry(request);

          return {
            async unwrap() {
              try {
                return (await unwrapUpdateEventEntry(
                  request
                )) as UpdateEventEntryResponse;
              } catch (error) {
                notifyError({
                  content: getApiErrorMessage(error),
                  header: "Unable to save event"
                });
                throw error;
              }
            }
          };
        }

        return [
          updateEventEntryTrigger,
          { errorMessage: undefined, isLoading: false }
        ] satisfies MutationHookResult<UpdateEventEntryResponse>;
      }
    );
  }
});

function CreateEventEntryDialog() {
  return (
    <EventEntryDialog topicId="topic-1">
      <button type="button">Open create</button>
    </EventEntryDialog>
  );
}

function EditEventEntryDialog() {
  return (
    <EventEntryDialog entry={eventEntryReadModel} topicId="topic-1">
      <button type="button">Open edit</button>
    </EventEntryDialog>
  );
}

async function openDialog(triggerName: string, dialogName: string) {
  fireEvent.click(screen.getByRole("button", { name: triggerName }));
  return screen.findByRole("dialog", { name: dialogName });
}

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

function addSourceUrl(dialog: HTMLElement, url: string) {
  const sourceCount =
    within(dialog).queryAllByLabelText(/Source URL \d+/u).length;

  fireEvent.click(within(dialog).getByRole("button", { name: "Add source" }));
  fireEvent.change(
    within(dialog).getByLabelText(`Source URL ${sourceCount + 1}`),
    {
      target: { value: url }
    }
  );
}
