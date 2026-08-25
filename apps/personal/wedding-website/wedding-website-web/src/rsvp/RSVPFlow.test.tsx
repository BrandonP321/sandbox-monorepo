import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import App from "../App";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

function startRsvp() {
  const view = render(<App />);
  fireEvent.click(screen.getByRole("link", { name: "RSVP" }));
  return view;
}

function getAdultEmailInputs() {
  return screen.getAllByRole("textbox", { name: "Email address (optional)" });
}

function getAdultPhoneInputs() {
  return screen.getAllByRole("textbox", { name: "Phone number (optional)" });
}

function completeRespondent({
  attendance = "Attending",
  email = "alex@example.test",
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
  const attendanceGroup = screen.getByRole("group", {
    name: "Will you attend?"
  });
  fireEvent.click(
    within(attendanceGroup).getByRole("radio", { name: attendance })
  );
}

function continueToDetails() {
  completeRespondent();
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    screen.getByRole("heading", { name: "Additional details" })
  ).toBeInTheDocument();
}

function expectContactAlertBefore(buttonName: string) {
  const alert = screen.getByRole("alert");
  const button = screen.getByRole("button", { name: buttonName });

  expect(within(alert).getByText("Contact details required")).toBeVisible();
  expect(
    within(alert).getByText("Enter at least an email address or phone number.")
  ).toBeVisible();
  expect(
    alert.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING
  ).not.toBe(0);

  return alert;
}

describe("RSVP party and attendance", () => {
  it("requires a guest-list side and explains the choice without access claims", () => {
    startRsvp();

    const sideGroup = screen.getByRole("group", {
      name: "Which side of the guest list are you on?"
    });
    expect(sideGroup).toHaveAccessibleDescription(
      "This just helps us organize responses. If you know both of us, choose whichever side feels like the better fit."
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(sideGroup).toHaveAccessibleDescription(
      /Error: Choose Niamh's side or Brandon's side\./
    );
    expect(
      within(sideGroup).getByRole("radio", { name: "Niamh's side" })
    ).toHaveFocus();
    expect(screen.queryByText(/different (card|invitation|link)/i)).toBeNull();
  });

  it("starts with optional contact fields on the respondent and no eligibility UI", () => {
    startRsvp();

    expect(
      screen.getByRole("heading", { level: 2, name: "You" })
    ).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("");
    expect(getAdultEmailInputs()).toHaveLength(1);
    expect(getAdultPhoneInputs()).toHaveLength(1);
    expect(
      screen.getByRole("group", { name: "Will you attend?" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/eligible|eligibility/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bring a guest/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("adds, independently updates, and removes another adult and their contacts", () => {
    startRsvp();
    completeRespondent({ attendance: "Not sure yet" });
    fireEvent.click(
      screen.getByRole("button", { name: "+ Add another adult" })
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Adult 2 name" }), {
      target: { value: "Sam Example" }
    });
    fireEvent.change(getAdultPhoneInputs()[1]!, {
      target: { value: "+1 (415) 555-0199" }
    });
    const additionalAttendance = screen.getByRole("group", {
      name: "Will Adult 2 attend?"
    });
    fireEvent.click(
      within(additionalAttendance).getByRole("radio", {
        name: "Unable to attend"
      })
    );

    expect(getAdultEmailInputs()).toHaveLength(2);
    expect(getAdultPhoneInputs()[1]).toHaveValue("+1 415 555 0199");
    expect(
      within(screen.getByRole("group", { name: "Will you attend?" })).getByRole(
        "radio",
        { name: "Not sure yet" }
      )
    ).toBeChecked();
    expect(
      within(additionalAttendance).getByRole("radio", {
        name: "Unable to attend"
      })
    ).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Remove adult 2" }));
    expect(screen.queryByRole("textbox", { name: "Adult 2 name" })).toBeNull();
    expect(getAdultEmailInputs()).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue(
      "Alex Example"
    );
  });

  it("shows the full contact Alert and blocks Continue when no adult has contact details", () => {
    startRsvp();
    completeRespondent({ email: "", phone: "" });

    const continueButton = screen.getByRole("button", { name: "Continue" });
    continueButton.focus();
    fireEvent.click(continueButton);

    expectContactAlertBefore("Continue");
    expect(continueButton).toHaveFocus();
    expect(getAdultEmailInputs()[0]).toHaveAccessibleDescription(
      "Contact details required Enter at least an email address or phone number."
    );
    expect(
      screen.getByRole("heading", { name: "Your party & attendance" })
    ).toBeInTheDocument();
  });

  it("plausibly validates contact values provided for an adult", () => {
    startRsvp();
    completeRespondent({ email: "not-an-email", phone: "123" });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(getAdultEmailInputs()[0]).toHaveFocus();
    expect(getAdultEmailInputs()[0]).toHaveAccessibleDescription(
      /Enter a valid email address\./
    );
    expect(getAdultPhoneInputs()[0]).toHaveAccessibleDescription(
      /Enter a phone number with 7 to 15 digits\./
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("accepts zero and nonzero child counts and rejects a negative count", () => {
    startRsvp();
    completeRespondent();
    const childCount = screen.getByRole("spinbutton", {
      name: "Number of children attending"
    });

    expect(childCount).toHaveValue(0);
    fireEvent.change(childCount, { target: { value: "-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(childCount).toHaveFocus();
    expect(childCount).toHaveAccessibleDescription(
      /Error: Enter a whole number of zero or greater\./
    );

    fireEvent.change(childCount, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("heading", { name: "Additional details" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByRole("spinbutton", { name: "Number of children attending" })
    ).toHaveValue(3);
  });

  it("prefills each details contact from the first matching adult without overwriting edits", () => {
    startRsvp();
    completeRespondent({ email: "", phone: "+1 (415) 555-0123" });
    fireEvent.click(
      screen.getByRole("button", { name: "+ Add another adult" })
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Adult 2 name" }), {
      target: { value: "Sam Example" }
    });
    fireEvent.change(getAdultEmailInputs()[1]!, {
      target: { value: "sam@example.test" }
    });
    fireEvent.click(
      within(
        screen.getByRole("group", { name: "Will Adult 2 attend?" })
      ).getByRole("radio", { name: "Attending" })
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const detailsEmail = screen.getByRole("textbox", { name: "Email address" });
    const detailsPhone = screen.getByRole("textbox", { name: "Phone number" });
    expect(detailsEmail).toHaveValue("sam@example.test");
    expect(detailsPhone).toHaveValue("+1 415 555 0123");

    fireEvent.change(detailsEmail, {
      target: { value: "edited@example.test" }
    });
    fireEvent.change(detailsPhone, { target: { value: "555-777-1234" } });
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.change(getAdultEmailInputs()[1]!, {
      target: { value: "changed@example.test" }
    });
    fireEvent.change(getAdultPhoneInputs()[0]!, {
      target: { value: "555-000-0000" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveValue(
      "edited@example.test"
    );
    expect(screen.getByRole("textbox", { name: "Phone number" })).toHaveValue(
      "(555) 777-1234"
    );
  });
});

describe("RSVP additional details", () => {
  it("shows the full contact Alert below the contact fields when both are empty", () => {
    startRsvp();
    continueToDetails();
    const email = screen.getByRole("textbox", { name: "Email address" });
    const phone = screen.getByRole("textbox", { name: "Phone number" });
    fireEvent.change(email, { target: { value: "" } });
    fireEvent.change(phone, { target: { value: "" } });

    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    const alert = expectContactAlertBefore("Continue to review");
    const contactGroup = screen.getByRole("group", { name: "Contact details" });
    expect(contactGroup).toContainElement(alert);
    expect(
      phone.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);
    expect(email).toHaveFocus();
    expect(email).toHaveAccessibleDescription(
      "Contact details required Enter at least an email address or phone number."
    );
    expect(phone).toHaveAccessibleDescription(
      "Contact details required Enter at least an email address or phone number."
    );
  });

  it("accepts email as the only party contact method", () => {
    startRsvp();
    continueToDetails();
    fireEvent.change(screen.getByRole("textbox", { name: "Phone number" }), {
      target: { value: "" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    expect(
      screen.getByRole("heading", { name: "Review your RSVP" })
    ).toBeVisible();
  });

  it("accepts phone as the only party contact method", () => {
    startRsvp();
    continueToDetails();
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "" }
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Phone number" }), {
      target: { value: "+1 (415) 555-0123" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    expect(
      screen.getByRole("heading", { name: "Review your RSVP" })
    ).toBeVisible();
  });

  it("plausibly validates each provided party contact value", () => {
    startRsvp();
    continueToDetails();
    const email = screen.getByRole("textbox", { name: "Email address" });
    const phone = screen.getByRole("textbox", { name: "Phone number" });
    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.change(phone, { target: { value: "123" } });

    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    expect(email).toHaveFocus();
    expect(email).toHaveAccessibleDescription(/Enter a valid email address\./);
    expect(phone).toHaveAccessibleDescription(
      /Enter a phone number with 7 to 15 digits\./
    );
  });

  it("preserves party and detail values across Back and Continue", async () => {
    startRsvp();
    completeRespondent({
      attendance: "Not sure yet",
      email: "alex@example.test",
      name: "Alex Example",
      side: "Brandon's side"
    });
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "Number of children attending" }),
      { target: { value: "2" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "party@example.test" }
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

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("radio", { name: "Brandon's side" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue(
      "Alex Example"
    );
    expect(getAdultEmailInputs()[0]).toHaveValue("alex@example.test");
    expect(
      screen.getByRole("spinbutton", { name: "Number of children attending" })
    ).toHaveValue(2);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveValue(
      "party@example.test"
    );
    expect(
      screen.getByRole("textbox", { name: "Dietary restrictions or allergies" })
    ).toHaveValue("Nut allergy");
    expect(
      screen.getByRole("textbox", { name: "Accessibility or accommodations" })
    ).toHaveValue("Step-free access");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Additional details" })
      ).toHaveFocus()
    );
  });
});
