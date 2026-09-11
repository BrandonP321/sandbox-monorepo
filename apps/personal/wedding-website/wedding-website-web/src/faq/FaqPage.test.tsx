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

const faqQuestions = [
  {
    answer:
      "Use the RSVP page on this website and follow the prompts. Please include only the people covered by your invitation. You can respond for each adult in your party and provide any additional details we ask for before submitting.",
    question: "How do I RSVP?"
  },
  {
    answer:
      "Yes. If your plans change, please submit a new RSVP with your updated information or contact us directly. We’ll use the most current information when we reconcile responses.",
    question: "Can I change my RSVP after I submit it?"
  },
  {
    answer:
      "Please include only the people covered by your invitation. If your invitation includes another adult guest, add them to your RSVP as an additional adult.",
    question: "Who should I include on my RSVP?"
  },
  {
    answer:
      "Please bring a guest only if your invitation includes one. If it does, add that person as another adult when you RSVP. If you’re unsure whether your invitation includes a guest, please contact us.",
    question: "Can I bring a plus-one?"
  },
  {
    answer: "Yes! Please include them in the special notes when you RSVP.",
    question: "Can I bring my children?"
  },
  {
    answer:
      "Please RSVP by January 15, 2027. If you need to make a change after that date, contact us directly.",
    question: "When is the RSVP deadline?"
  },
  {
    answer:
      "Full location details will be available on our Wedding Day page once they are finalized. We’ll make sure guests have the address and directions they need before the wedding.",
    question: "Where is the wedding?"
  },
  {
    answer:
      "The ceremony start time will be listed on our Wedding Day page. Please check there for the most current timing information.",
    question: "What time does the wedding start?"
  },
  {
    answer:
      "Recommended arrival time will be listed on our Wedding Day page. The time provided will give you time to park, get settled, grab a drink and be seated before the ceremony begins.",
    question: "What time should I arrive?"
  },
  {
    answer:
      "We’ll post the day’s schedule on our Wedding Day page once the final timeline is set.",
    question: "What is the schedule for the day?"
  },
  {
    answer:
      "Parking instructions will be posted on our Wedding Day page once the final plan is confirmed. Please check that page before heading to the wedding.",
    question: "Where should I park?"
  },
  {
    answer:
      "We’ll update this answer once our transportation plans are finalized. Any shuttle, rideshare, or drop-off instructions will also be listed on the Wedding Day page.",
    question: "Will transportation or a shuttle be provided?"
  },
  {
    answer:
      "We’ll share indoor/outdoor details once the final setup is confirmed so you can plan appropriately for the weather and venue.",
    question: "Will the ceremony and reception be indoors or outdoors?"
  },
  {
    answer:
      "We’ll have a weather contingency plan and will post any important updates on the Wedding Day page as the wedding gets closer.",
    question: "What happens if it rains or the weather is bad?"
  },
  {
    answer:
      "To celebrate the beginning of our marriage, we’d love to see lots of bright and colorful outfits! We kindly ask that blue be the one color you leave at home, as it’s reserved for our honored guests. We’ll also include any helpful footwear or weather guidance on the Wedding Day page as we get closer to the big day.",
    question: "What should I wear?"
  },
  {
    answer:
      "Yes. Please include any dietary restrictions or allergies in the RSVP form so we can plan accordingly. If we need more information, we’ll follow up with you.",
    question: "Can you accommodate dietary restrictions or food allergies?"
  },
  {
    answer:
      "Please tell us about any accessibility or accommodation needs in the RSVP form, or contact us directly if you’d rather discuss them with us. We want to make the day as comfortable and accessible as we reasonably can.",
    question: "What if I need an accessibility accommodation?"
  },
  {
    answer:
      "We’d love for everyone to be fully present during the ceremony, so please keep phones and cameras away until afterward. After all official events have concluded you’re welcome to take photos as long as you remain mindful of others and our photographer.",
    question: "Can I take photos during the ceremony?"
  },
  {
    answer:
      "Absolutely! We’d love to see your photos. Please be thoughtful about posting photos of other guests.",
    question: "Can I post wedding photos on social media?"
  },
  {
    answer:
      "We’re registered on Amazon, and we’re also planning a honeymoon fund for anyone who would prefer to contribute toward our trip. Gifts are completely optional. You celebrating with us is what matters most. Visit our Registry & Gifts page for the current links and details.",
    question: "Where are you registered?"
  },
  {
    answer: "Please contact Brandon or Niamh directly. We’re happy to help!",
    question: "Who should I contact if I have another question?"
  }
] as const;

describe("FaqPage", () => {
  it("renders every Google Doc question and answer in semantic order", () => {
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
      "Wedding Day & logistics",
      "Food, allergies & accessibility",
      "Photos & social media",
      "Gifts",
      "Another question?"
    ]);

    const questionHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(questionHeadings.map((heading) => heading.textContent)).toEqual(
      faqQuestions.map(({ question }) => question)
    );
    faqQuestions.forEach(({ answer }, index) => {
      expect(questionHeadings[index]?.parentElement).toHaveTextContent(answer);
    });

    expect(screen.getByRole("main")).not.toHaveTextContent("—");
    expect(screen.queryByText("Niamh & Brandon")).toBeNull();
    expect(screen.queryByRole("link", { name: "RSVP" })).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("isolates the RSVP font correction to the VP letters", () => {
    render(<FaqPage onNavigate={vi.fn()} />);

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "RSVP & invitations"
    });

    expect(heading.querySelectorAll(".faq-page__rsvp-letterfix")).toHaveLength(
      1
    );
    expect(
      heading.querySelector(".faq-page__rsvp-letterfix")
    ).toHaveTextContent("VP");
  });

  it("routes inline and footer links through the shared guest navigation", () => {
    const onNavigate = vi.fn(
      (event: MouseEvent<HTMLAnchorElement>, destination: GuestDestination) => {
        event.preventDefault();
        return destination;
      }
    );
    render(<FaqPage onNavigate={onNavigate} />);

    const rsvpLink = screen.getByRole("link", { name: "RSVP page" });
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
