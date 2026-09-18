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
          { text: "Use the ", type: "text" },
          { destination: "rsvp", text: "RSVP page", type: "link" },
          {
            text: " on this website and follow the prompts. Please include only the people covered by your invitation. You can respond for each adult in your party and provide any additional details we ask for before submitting.",
            type: "text"
          }
        ]
      },
      {
        id: "change-submitted-rsvp",
        question: "Can I change my RSVP after I submit it?",
        answer: [
          {
            text: "Yes. If your plans change, please submit a new RSVP with your updated information or contact us directly. We’ll use the most current information when we reconcile responses.",
            type: "text"
          }
        ]
      },
      {
        id: "invitation-coverage",
        question: "Who should I include on my RSVP?",
        answer: [
          {
            text: "Please include only the people covered by your invitation. If your invitation includes another adult guest, add them to your RSVP as an additional adult.",
            type: "text"
          }
        ]
      },
      {
        id: "plus-one",
        question: "Can I bring a plus-one?",
        answer: [
          {
            text: "Please bring a guest only if your invitation includes one. If it does, add that person as another adult when you RSVP. If you’re unsure whether your invitation includes a guest, please contact us.",
            type: "text"
          }
        ]
      },
      {
        id: "children",
        question: "Can I bring my children?",
        answer: [
          {
            text: "Yes! Please include them in the special notes when you RSVP.",
            type: "text"
          }
        ]
      },
      {
        id: "rsvp-deadline",
        question: "When is the RSVP deadline?",
        answer: [
          {
            text: "Please RSVP by January 15, 2027. If you need to make a change after that date, contact us directly.",
            type: "text"
          }
        ]
      }
    ]
  },
  {
    id: "wedding-day-logistics",
    title: "Wedding Day & logistics",
    questions: [
      {
        id: "wedding-location",
        question: "Where is the wedding?",
        answer: [
          {
            text: "Full location details will be available on our Wedding Day page once they are finalized. We’ll make sure guests have the address and directions they need before the wedding.",
            type: "text"
          }
        ]
      },
      {
        id: "wedding-start-time",
        question: "What time does the wedding start?",
        answer: [
          {
            text: "The ceremony start time will be listed on our Wedding Day page. Please check there for the most current timing information.",
            type: "text"
          }
        ]
      },
      {
        id: "arrival-time",
        question: "What time should I arrive?",
        answer: [
          {
            text: "Recommended arrival time will be listed on our Wedding Day page. The time provided will give you time to park, get settled, grab a drink and be seated before the ceremony begins.",
            type: "text"
          }
        ]
      },
      {
        id: "wedding-day-schedule",
        question: "What is the schedule for the day?",
        answer: [
          {
            text: "We’ll post the day’s schedule on our Wedding Day page once the final timeline is set.",
            type: "text"
          }
        ]
      },
      {
        id: "parking",
        question: "Where should I park?",
        answer: [
          {
            text: "Parking instructions will be posted on our Wedding Day page once the final plan is confirmed. Please check that page before heading to the wedding.",
            type: "text"
          }
        ]
      },
      {
        id: "transportation",
        question: "Will transportation or a shuttle be provided?",
        answer: [
          {
            text: "We’ll update this answer once our transportation plans are finalized. Any shuttle, rideshare, or drop-off instructions will also be listed on the Wedding Day page.",
            type: "text"
          }
        ]
      },
      {
        id: "indoor-outdoor",
        question: "Will the ceremony and reception be indoors or outdoors?",
        answer: [
          {
            text: "We’ll share indoor/outdoor details once the final setup is confirmed so you can plan appropriately for the weather and venue.",
            type: "text"
          }
        ]
      },
      {
        id: "bad-weather",
        question: "What happens if it rains or the weather is bad?",
        answer: [
          {
            text: "We’ll have a weather contingency plan and will post any important updates on the Wedding Day page as the wedding gets closer.",
            type: "text"
          }
        ]
      },
      {
        id: "attire",
        question: "What should I wear?",
        answer: [
          {
            text: "To celebrate the beginning of our marriage, we’d love to see lots of bright and colorful outfits! We kindly ask that blue be the one color you leave at home, as it’s reserved for the wedding party. We’ll also include any helpful footwear or weather guidance on the Wedding Day page as we get closer to the big day.",
            type: "text"
          }
        ]
      }
    ]
  },
  {
    id: "food-allergies-accessibility",
    title: "Food, allergies & accessibility",
    questions: [
      {
        id: "dietary-restrictions-allergies",
        question: "Can you accommodate dietary restrictions or food allergies?",
        answer: [
          {
            text: "Yes. Please include any dietary restrictions or allergies in the RSVP form so we can plan accordingly. If we need more information, we’ll follow up with you.",
            type: "text"
          }
        ]
      },
      {
        id: "accessibility-accommodation",
        question: "What if I need an accessibility accommodation?",
        answer: [
          {
            text: "Please tell us about any accessibility or accommodation needs in the RSVP form, or contact us directly if you’d rather discuss them with us. We want to make the day as comfortable and accessible as we reasonably can.",
            type: "text"
          }
        ]
      }
    ]
  },
  {
    id: "photos-social-media",
    title: "Photos & social media",
    questions: [
      {
        id: "ceremony-photos",
        question: "Can I take photos during the ceremony?",
        answer: [
          {
            text: "We’d love for everyone to be fully present during the ceremony, so please keep phones and cameras away until afterward. After all official events have concluded you’re welcome to take photos as long as you remain mindful of others and our photographer.",
            type: "text"
          }
        ]
      },
      {
        id: "social-media",
        question: "Can I post wedding photos on social media?",
        answer: [
          {
            text: "Absolutely! We’d love to see your photos. Please be thoughtful about posting photos of other guests.",
            type: "text"
          }
        ]
      }
    ]
  },
  {
    id: "gifts",
    title: "Gifts",
    questions: [
      {
        id: "where-registered",
        question: "Where are you registered?",
        answer: [
          {
            text: "We’re registered on Amazon, and we’re also planning a honeymoon fund for anyone who would prefer to contribute toward our trip. Gifts are completely optional. You celebrating with us is what matters most. Visit our ",
            type: "text"
          },
          {
            destination: "registry",
            text: "Registry & Gifts page",
            type: "link"
          },
          {
            text: " for the current links and details.",
            type: "text"
          }
        ]
      }
    ]
  },
  {
    id: "another-question",
    title: "Another question?",
    questions: [
      {
        id: "contact",
        question: "Who should I contact if I have another question?",
        answer: [
          {
            text: "Please contact Brandon or Niamh directly. We’re happy to help!",
            type: "text"
          }
        ]
      }
    ]
  }
] as const satisfies readonly FaqSection[];

export {
  type FaqAnswerPart,
  type FaqLinkDestination,
  type FaqQuestion,
  type FaqSection,
  faqSections
};
