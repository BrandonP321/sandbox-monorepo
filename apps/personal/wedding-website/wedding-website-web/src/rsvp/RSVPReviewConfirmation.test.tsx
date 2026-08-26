import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import { createInitialDraft } from "./rsvpDraft";
import {
  PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_VERSION
} from "./prototypeStorage";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => createSuccessResponse())
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function startRsvp() {
  const view = render(<App />);
  fireEvent.click(screen.getByRole("link", { name: "RSVP" }));
  return view;
}

function createSuccessResponse(): Response {
  return new Response(
    JSON.stringify({
      submissionId: "4c338adc-ff18-4d44-8062-d425903472fb",
      submittedAt: "2026-08-26T01:35:31.468Z",
      schemaVersion: 1
    }),
    { status: 201 }
  );
}

function getAdultEmailInputs() {
  return screen.getAllByRole("textbox", { name: "Email address (optional)" });
}

function getAdultPhoneInputs() {
  return screen.getAllByRole("textbox", { name: "Phone number (optional)" });
}

function completeRespondent({
  attendance = "Attending",
  email = "alex-adult@example.test",
  name = "Alex Example",
  phone = "",
  side = "Niamh's side"
}: {
  attendance?: "Attending" | "Not sure yet" | "Unable to attend";
  email?: string;
  name?: string;
  phone?: string;
  side?: "Niamh's side" | "Brandon's side";
} = {}) {
  fireEvent.click(screen.getByRole("radio", { name: side }));
  fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
    target: { value: name }
  });
  fireEvent.change(getAdultEmailInputs()[0]!, {
    target: { value: email }
  });
  fireEvent.change(getAdultPhoneInputs()[0]!, {
    target: { value: phone }
  });
  fireEvent.click(
    within(screen.getByRole("group", { name: "Will you attend?" })).getByRole(
      "radio",
      { name: attendance }
    )
  );
}

function continueToDetails() {
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    screen.getByRole("heading", { name: "Additional details" })
  ).toBeVisible();
}

function continueToReview({
  email = "alex@example.test",
  phone = ""
}: { email?: string; phone?: string } = {}) {
  if (email) {
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: email }
    });
  }
  if (phone) {
    fireEvent.change(screen.getByRole("textbox", { name: "Phone number" }), {
      target: { value: phone }
    });
  }
  fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));
  expect(
    screen.getByRole("heading", { name: "Review your RSVP" })
  ).toBeVisible();
}

describe("RSVP review", () => {
  it("summarizes the complete party, contact, notes, and attending count", async () => {
    startRsvp();
    completeRespondent();
    fireEvent.click(
      screen.getByRole("button", { name: "+ Add another adult" })
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Adult 2 name" }), {
      target: { value: "Sam Example" }
    });
    fireEvent.change(getAdultPhoneInputs()[1]!, {
      target: { value: "+1 (415) 555-0199" }
    });
    fireEvent.click(
      within(
        screen.getByRole("group", { name: "Will Adult 2 attend?" })
      ).getByRole("radio", { name: "Not sure yet" })
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "Number of children attending" }),
      { target: { value: "2" } }
    );
    continueToDetails();

    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "party@example.test" }
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Phone number" }), {
      target: { value: "+1 (415) 555-0123" }
    });
    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Dietary restrictions or allergies"
      }),
      { target: { value: "Nut allergy" } }
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "Accessibility or accommodations" }),
      { target: { value: "Step-free access" } }
    );
    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Anything else you would like us to know?"
      }),
      { target: { value: "We are excited!" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    const partySection = screen.getByRole("region", {
      name: "Party & attendance"
    });
    expect(within(partySection).getByText("Niamh's side")).toBeVisible();
    expect(within(partySection).getByText("Alex Example")).toBeVisible();
    expect(within(partySection).getByText("Sam Example")).toBeVisible();
    expect(
      within(partySection).getByText("alex-adult@example.test")
    ).toBeVisible();
    expect(within(partySection).getByText("+1 415 555 0199")).toBeVisible();
    expect(within(partySection).getByText("Attending")).toBeVisible();
    expect(within(partySection).getByText("Not sure yet")).toBeVisible();
    expect(within(partySection).getByText("3")).toBeVisible();
    expect(within(partySection).getByText("2")).toBeVisible();

    const contactSection = screen.getByRole("region", {
      name: "Contact details"
    });
    expect(
      within(contactSection).getByText("party@example.test")
    ).toBeVisible();
    expect(within(contactSection).getByText("+1 415 555 0123")).toBeVisible();

    const notesSection = screen.getByRole("region", { name: "Notes" });
    expect(within(notesSection).getByText("Nut allergy")).toBeVisible();
    expect(within(notesSection).getByText("Step-free access")).toBeVisible();
    expect(within(notesSection).getByText("We are excited!")).toBeVisible();
    expect(
      screen.getByText("August 21, 2027", { selector: "time" })
    ).toHaveAttribute("datetime", "2027-08-21");

    const home = screen.getByRole("link", { name: "Home" });
    const back = screen.getByRole("button", { name: "Back to details" });
    const submit = screen.getByRole("button", { name: "Submit RSVP" });
    const secondaryActions = home.parentElement;
    const primaryAction = submit.parentElement;
    expect(secondaryActions).toBe(back.parentElement);
    expect(primaryAction).not.toBe(secondaryActions);
    expect(
      secondaryActions!.compareDocumentPosition(primaryAction!) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);
    expect(
      home.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Review your RSVP" })
      ).toHaveFocus()
    );
  });

  it("omits empty optional sections and preserves values when editing details", () => {
    startRsvp();
    completeRespondent({
      attendance: "Unable to attend",
      side: "Brandon's side"
    });
    continueToDetails();
    continueToReview({ email: "alex@example.test" });

    expect(screen.getByText("Brandon's side")).toBeVisible();
    expect(screen.queryByRole("region", { name: "Notes" })).toBeNull();
    const contactSection = screen.getByRole("region", {
      name: "Contact details"
    });
    expect(within(contactSection).getByText("alex@example.test")).toBeVisible();
    expect(within(contactSection).queryByText("Phone")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Back to details" }));

    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveValue(
      "alex@example.test"
    );
    expect(screen.getByRole("textbox", { name: "Phone number" })).toHaveValue(
      ""
    );
  });

  it("blocks a stale invalid review draft and routes editing to the earliest stage", () => {
    window.localStorage.setItem(
      PROTOTYPE_STORAGE_KEY,
      JSON.stringify({
        version: PROTOTYPE_STORAGE_VERSION,
        state: { currentStage: "review", draft: createInitialDraft() },
        unresolvedAttempt: null
      })
    );
    window.history.replaceState(null, "", "/RSVP");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    const alert = screen.getByRole("alert");
    expect(
      within(alert).getByText("A few answers need attention")
    ).toBeVisible();
    const editButton = within(alert).getByRole("button", {
      name: "Edit party & attendance"
    });
    fireEvent.click(editButton);
    expect(
      screen.getByRole("heading", { name: "Your party & attendance" })
    ).toBeVisible();
  });

  it("reruns details validation when the party remains valid", () => {
    const draft = createInitialDraft();
    draft.guestSide = "niamh";
    draft.adults[0].name = "Alex Example";
    draft.adults[0].attendance = "attending";
    draft.adults[0].contact.email = "adult@example.test";

    window.localStorage.setItem(
      PROTOTYPE_STORAGE_KEY,
      JSON.stringify({
        version: PROTOTYPE_STORAGE_VERSION,
        state: { currentStage: "review", draft },
        unresolvedAttempt: null
      })
    );
    window.history.replaceState(null, "", "/RSVP");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    const alert = screen.getByRole("alert");
    const editButton = within(alert).getByRole("button", {
      name: "Edit additional details"
    });
    fireEvent.click(editButton);
    expect(
      screen.getByRole("heading", { name: "Additional details" })
    ).toBeVisible();
  });

  it("reruns the across-adults contact requirement before submission", () => {
    const draft = createInitialDraft();
    draft.guestSide = "niamh";
    draft.adults[0].name = "Alex Example";
    draft.adults[0].attendance = "attending";
    draft.contact.email = "party@example.test";

    window.localStorage.setItem(
      PROTOTYPE_STORAGE_KEY,
      JSON.stringify({
        version: PROTOTYPE_STORAGE_VERSION,
        state: { currentStage: "review", draft },
        unresolvedAttempt: null
      })
    );
    window.history.replaceState(null, "", "/RSVP");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    expect(
      within(screen.getByRole("alert")).getByRole("button", {
        name: "Edit party & attendance"
      })
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", {
        name: "Thank you—your RSVP is complete."
      })
    ).toBeNull();
  });
});

describe("RSVP confirmation", () => {
  it("shows a simple completion message and returns home to a clean future RSVP", async () => {
    const fetchSpy = vi.fn(async () => createSuccessResponse());
    vi.stubGlobal("fetch", fetchSpy);
    startRsvp();
    completeRespondent({ side: "Brandon's side" });
    continueToDetails();
    continueToReview({ phone: "+1 (415) 555-0123" });

    await waitFor(() =>
      expect(window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)).not.toBeNull()
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));

    const confirmationHeading = await screen.findByRole("heading", {
      name: "Thank you—your RSVP is complete."
    });
    expect(confirmationHeading).toBeVisible();
    await waitFor(() => expect(confirmationHeading).toHaveFocus());
    expect(
      screen.queryByRole("region", { name: "Submitted attendance" })
    ).toBeNull();
    expect(screen.queryByText(/guests? marked attending/i)).toBeNull();
    expect(
      screen.getByText(
        "If your plans change or you need to correct something, you can submit another RSVP or reach out to us directly."
      )
    ).toBeVisible();
    expect(window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)).toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/confirmation (email|sms)/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /view|edit/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Submit another RSVP" })
    ).toBeNull();
    expect(screen.queryByText(/verified|securely retrievable/i)).toBeNull();

    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("href", "/");
    expect(home).toHaveAttribute("data-variant", "primary");
    fireEvent.click(home);

    expect(window.location.pathname).toBe("/");
    expect(
      screen.getByRole("heading", { name: "Niamh & Brandon" })
    ).toBeVisible();

    fireEvent.click(screen.getByRole("link", { name: "RSVP" }));

    const attendanceHeading = screen.getByRole("heading", {
      name: "Your party & attendance"
    });
    expect(attendanceHeading).toBeVisible();
    expect(attendanceHeading).not.toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("");
    expect(
      screen.getByRole("spinbutton", { name: "Number of children attending" })
    ).toHaveValue(0);
    expect(
      screen.getByRole("radio", { name: "Niamh's side" })
    ).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Brandon's side" })
    ).not.toBeChecked();
    expect(window.location.pathname).toBe("/RSVP");
  });

  it("does not recreate a completed response after refresh", async () => {
    const view = startRsvp();
    completeRespondent();
    continueToDetails();
    continueToReview();
    fireEvent.click(screen.getByRole("button", { name: "Submit RSVP" }));
    expect(
      await screen.findByRole("heading", {
        name: "Thank you—your RSVP is complete."
      })
    ).toBeVisible();

    view.unmount();
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Your party & attendance" })
    ).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("");
    expect(screen.queryByText(/RSVP is complete/i)).toBeNull();
  });
});
