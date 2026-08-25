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
});

function startRsvp() {
  const view = render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "RSVP" }));
  return view;
}

function completeRespondent({
  attendance = "Attending",
  name = "Alex Example",
  side = "Niamh's side"
}: {
  attendance?: "Attending" | "Not sure yet" | "Unable to attend";
  name?: string;
  side?: "Niamh's side" | "Brandon's side";
} = {}) {
  fireEvent.click(screen.getByRole("radio", { name: side }));
  fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
    target: { value: name }
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

describe("RSVP party and attendance", () => {
  it("requires a guest-list side and explains the choice without access claims", () => {
    startRsvp();

    const sideGroup = screen.getByRole("group", {
      name: "Which side of the guest list are you on?"
    });
    expect(sideGroup).toHaveAccessibleDescription(
      "This just helps us organize responses. If you know both of us, choose whichever side feels like the better fit."
    );
    expect(
      within(sideGroup).getByRole("radio", { name: "Niamh's side" })
    ).not.toBeChecked();
    expect(
      within(sideGroup).getByRole("radio", { name: "Brandon's side" })
    ).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(sideGroup).toHaveAccessibleDescription(
      /Error: Choose Niamh's side or Brandon's side\./
    );
    expect(
      within(sideGroup).getByRole("radio", { name: "Niamh's side" })
    ).toHaveFocus();
    expect(screen.queryByText(/different (card|invitation|link)/i)).toBeNull();
  });

  it("starts with the respondent as the first adult and no eligibility UI", () => {
    startRsvp();

    expect(
      screen.getByRole("heading", { level: 2, name: "You" })
    ).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("");
    expect(
      screen.getByRole("group", { name: "Will you attend?" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/If your invitation includes a guest/i)
    ).toBeVisible();
    expect(screen.queryByText(/eligible|eligibility/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bring a guest/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove adult 1/i })
    ).toBeNull();
  });

  it("adds, independently updates, and removes another adult", () => {
    startRsvp();
    completeRespondent({ attendance: "Not sure yet" });
    fireEvent.click(
      screen.getByRole("button", { name: "+ Add another adult" })
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Adult 2 name" }), {
      target: { value: "Sam Example" }
    });
    const additionalAttendance = screen.getByRole("group", {
      name: "Will Adult 2 attend?"
    });
    fireEvent.click(
      within(additionalAttendance).getByRole("radio", {
        name: "Unable to attend"
      })
    );

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
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue(
      "Alex Example"
    );
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
});

describe("RSVP additional details", () => {
  it("blocks Continue when neither contact method is provided", () => {
    startRsvp();
    continueToDetails();

    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    const email = screen.getByRole("textbox", { name: "Email address" });
    const phone = screen.getByRole("textbox", { name: "Phone number" });
    expect(email).toHaveFocus();
    expect(email).toHaveAccessibleDescription(
      /Enter at least an email address or phone number\./
    );
    expect(phone).toHaveAccessibleDescription(
      /Enter at least an email address or phone number\./
    );
    expect(
      screen.getByRole("heading", { name: "Additional details" })
    ).toBeInTheDocument();
  });

  it("accepts email as the only contact method", () => {
    startRsvp();
    continueToDetails();
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "party@example.test" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    expect(
      screen.getByRole("heading", { name: "Review your RSVP" })
    ).toBeVisible();
  });

  it("accepts phone as the only contact method", () => {
    startRsvp();
    continueToDetails();
    fireEvent.change(screen.getByRole("textbox", { name: "Phone number" }), {
      target: { value: "+1 (415) 555-0123" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    expect(
      screen.getByRole("heading", { name: "Review your RSVP" })
    ).toBeVisible();
  });

  it("plausibly validates each provided contact value", () => {
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
      name: "Alex Example",
      side: "Brandon's side"
    });
    fireEvent.click(
      screen.getByRole("button", { name: "+ Add another adult" })
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Adult 2 name" }), {
      target: { value: "Sam Example" }
    });
    fireEvent.click(
      within(
        screen.getByRole("group", { name: "Will Adult 2 attend?" })
      ).getByRole("radio", { name: "Attending" })
    );
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
    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Anything else you would like us to know?"
      }),
      { target: { value: "Looking forward to it" } }
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("radio", { name: "Brandon's side" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue(
      "Alex Example"
    );
    expect(screen.getByRole("textbox", { name: "Adult 2 name" })).toHaveValue(
      "Sam Example"
    );
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
    expect(
      screen.getByRole("textbox", {
        name: "Anything else you would like us to know?"
      })
    ).toHaveValue("Looking forward to it");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Additional details" })
      ).toHaveFocus()
    );
  });
});
