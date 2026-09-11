import { fireEvent, render, screen } from "@testing-library/react";
import type { MouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  type GuestDestination,
  homeDestination,
  registryDestination,
  rsvpDestination
} from "../appRoutes";
import { FaqPage } from "./FaqPage";

const approvedQuestions = [
  {
    answer:
      "Open the RSVP form, enter the adults covered by your invitation, and choose an attendance response for each person. Add your contact information and any additional details, then review your answers and select “Submit RSVP.”",
    question: "How do I RSVP?"
  },
  {
    answer:
      "Yes. Submit another RSVP with your updated details or contact Brandon or Niamh directly. Previously submitted responses cannot be reopened on the website.",
    question: "Can I change my RSVP after submitting?"
  },
  {
    answer:
      "Please include only the people covered by your invitation. If your invitation includes a guest, add them as another adult. If you’re unsure, please check with us before adding someone.",
    question: "Who should I include? Can I bring a plus-one?"
  },
  {
    answer:
      "Choose “Not sure yet” or “Unable to attend” for each adult. People in the same RSVP can give different answers. You can submit another RSVP if your plans change.",
    question: "What if I’m not sure yet, or can’t attend?"
  },
  {
    answer:
      "You’ll see “Thank you—your RSVP is complete.” We don’t currently send confirmation emails or texts. If you see an error, follow the instructions and try again. Contact us if you’re still unsure.",
    question: "How do I know my RSVP went through?"
  },
  {
    answer:
      "Use the “Dietary restrictions or allergies” field under Additional details. Please say who each restriction applies to. Contact us directly to discuss a specific concern.",
    question: "How do I share dietary restrictions or allergies?"
  },
  {
    answer:
      "Use the “Accessibility or accommodations” field under Additional details to tell us what would help you or someone in your party. You can also contact us directly.",
    question: "How do I request an accommodation?"
  },
  {
    answer:
      "You can find our registry and honeymoon fund on our Registry & Gifts page. Gifts are completely optional—we’re most looking forward to celebrating with you.",
    question: "Where are you registered?"
  }
] as const;

describe("FaqPage", () => {
  it("renders the approved always-visible content in semantic order", () => {
    render(<FaqPage onNavigate={vi.fn()} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Frequently asked questions"
      })
    ).toHaveClass("guest-page-heading");
    expect(
      screen.getByText(
        "A few helpful answers as you plan to celebrate with us."
      )
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent)
    ).toEqual([
      "RSVP & invitations",
      "Comfort & accommodations",
      "Registry & gifts",
      "Another question?"
    ]);

    const questionHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(questionHeadings.map((heading) => heading.textContent)).toEqual(
      approvedQuestions.map(({ question }) => question)
    );
    approvedQuestions.forEach(({ answer }, index) => {
      expect(questionHeadings[index]?.parentElement).toHaveTextContent(answer);
    });

    expect(
      screen.getByText(
        "Please contact Brandon or Niamh directly—we’re happy to help."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Niamh & Brandon")).toBeNull();
    expect(screen.queryByRole("link", { name: "RSVP" })).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("routes inline and footer links through the shared guest navigation", () => {
    const onNavigate = vi.fn(
      (event: MouseEvent<HTMLAnchorElement>, destination: GuestDestination) => {
        event.preventDefault();
        return destination;
      }
    );
    render(<FaqPage onNavigate={onNavigate} />);

    const rsvpLink = screen.getByRole("link", { name: "RSVP form" });
    const registryLink = screen.getByRole("link", {
      name: "Registry & Gifts page"
    });
    const homeLink = screen.getByRole("link", { name: "Back to Home" });

    expect(rsvpLink).toHaveAttribute("href", "/RSVP");
    expect(registryLink).toHaveAttribute("href", "/registry");
    expect(homeLink).toHaveAttribute("href", "/");

    fireEvent.click(rsvpLink);
    fireEvent.click(registryLink);
    fireEvent.click(homeLink);

    expect(onNavigate.mock.calls.map(([, destination]) => destination)).toEqual(
      [rsvpDestination, registryDestination, homeDestination]
    );
  });

  it("keeps all artwork decorative and outside the answer content", () => {
    render(<FaqPage onNavigate={vi.fn()} />);

    const decorativeLayers = document.querySelectorAll(
      ".faq-page .ui-decorative-layer"
    );
    expect(decorativeLayers).toHaveLength(2);
    expect(document.querySelectorAll(".faq-page img")).toHaveLength(3);

    for (const layer of decorativeLayers) {
      expect(layer).toHaveAttribute("aria-hidden", "true");
      expect(layer.querySelector("button, a, input")).toBeNull();
      for (const image of layer.querySelectorAll("img")) {
        expect(image).toHaveAttribute("alt", "");
        expect(image).toHaveAttribute("draggable", "false");
      }
    }
  });
});
