import type { GuestRoute } from "../appRoutes";

type FaqLinkDestination = Extract<GuestRoute, "registry" | "rsvp">;

type FaqAnswerPart =
  | {
      text: string;
      type: "text";
    }
  | {
      destination: FaqLinkDestination;
      text: string;
      type: "link";
    };

type FaqQuestion = {
  answer: readonly FaqAnswerPart[];
  id: string;
  question: string;
};

type FaqSection = {
  id: string;
  questions: readonly FaqQuestion[];
  title: string;
};

const faqSections = [
  {
    id: "rsvp-invitations",
    title: "RSVP & invitations",
    questions: [
      {
        id: "how-to-rsvp",
        question: "How do I RSVP?",
        answer: [
          { text: "Open the ", type: "text" },
          { destination: "rsvp", text: "RSVP form", type: "link" },
          {
            text: ", enter the adults covered by your invitation, and choose an attendance response for each person. Add your contact information and any additional details, then review your answers and select “Submit RSVP.”",
            type: "text"
          }
        ]
      },
      {
        id: "change-submitted-rsvp",
        question: "Can I change my RSVP after submitting?",
        answer: [
          {
            text: "Yes. Submit another RSVP with your updated details or contact Brandon or Niamh directly. Previously submitted responses cannot be reopened on the website.",
            type: "text"
          }
        ]
      },
      {
        id: "invitation-coverage",
        question: "Who should I include? Can I bring a plus-one?",
        answer: [
          {
            text: "Please include only the people covered by your invitation. If your invitation includes a guest, add them as another adult. If you’re unsure, please check with us before adding someone.",
            type: "text"
          }
        ]
      },
      {
        id: "not-sure-or-unable-to-attend",
        question: "What if I’m not sure yet, or can’t attend?",
        answer: [
          {
            text: "Choose “Not sure yet” or “Unable to attend” for each adult. People in the same RSVP can give different answers. You can submit another RSVP if your plans change.",
            type: "text"
          }
        ]
      },
      {
        id: "submission-confirmation",
        question: "How do I know my RSVP went through?",
        answer: [
          {
            text: "You’ll see “Thank you—your RSVP is complete.” We don’t currently send confirmation emails or texts. If you see an error, follow the instructions and try again. Contact us if you’re still unsure.",
            type: "text"
          }
        ]
      }
    ]
  },
  {
    id: "comfort-accommodations",
    title: "Comfort & accommodations",
    questions: [
      {
        id: "dietary-restrictions-allergies",
        question: "How do I share dietary restrictions or allergies?",
        answer: [
          {
            text: "Use the “Dietary restrictions or allergies” field under Additional details. Please say who each restriction applies to. Contact us directly to discuss a specific concern.",
            type: "text"
          }
        ]
      },
      {
        id: "request-accommodation",
        question: "How do I request an accommodation?",
        answer: [
          {
            text: "Use the “Accessibility or accommodations” field under Additional details to tell us what would help you or someone in your party. You can also contact us directly.",
            type: "text"
          }
        ]
      }
    ]
  },
  {
    id: "registry-gifts",
    title: "Registry & gifts",
    questions: [
      {
        id: "where-registered",
        question: "Where are you registered?",
        answer: [
          {
            text: "You can find our registry and honeymoon fund on our ",
            type: "text"
          },
          {
            destination: "registry",
            text: "Registry & Gifts page",
            type: "link"
          },
          {
            text: ". Gifts are completely optional—we’re most looking forward to celebrating with you.",
            type: "text"
          }
        ]
      }
    ]
  }
] as const satisfies readonly FaqSection[];

const faqHelp = {
  id: "another-question",
  title: "Another question?",
  answer: "Please contact Brandon or Niamh directly—we’re happy to help."
} as const;

export {
  type FaqAnswerPart,
  type FaqLinkDestination,
  type FaqQuestion,
  type FaqSection,
  faqHelp,
  faqSections
};
