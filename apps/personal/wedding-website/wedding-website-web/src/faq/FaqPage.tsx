import { Fragment, type MouseEvent } from "react";

import {
  type GuestDestination,
  homeDestination,
  registryDestination,
  rsvpDestination
} from "../appRoutes";
import {
  ContentFrame,
  DecorativeLayer,
  FloralCornerDecoration,
  ProgressiveImage
} from "../components/ui";
import { weddingImageAssets } from "../weddingImageAssets";
import {
  type FaqAnswerPart,
  type FaqLinkDestination,
  faqHelp,
  faqSections
} from "./faqContent";

type FaqPageProps = {
  onNavigate: (
    event: MouseEvent<HTMLAnchorElement>,
    destination: GuestDestination
  ) => void;
};

const faqLinkDestinations = {
  registry: registryDestination,
  rsvp: rsvpDestination
} as const satisfies Record<FaqLinkDestination, GuestDestination>;

function FaqAnswer({
  onNavigate,
  parts
}: Pick<FaqPageProps, "onNavigate"> & {
  parts: readonly FaqAnswerPart[];
}) {
  return (
    <p>
      {parts.map((part, index) =>
        part.type === "link" ? (
          <a
            href={faqLinkDestinations[part.destination].path}
            key={`${part.destination}-${part.text}`}
            onClick={(event) =>
              onNavigate(event, faqLinkDestinations[part.destination])
            }
          >
            {part.text}
          </a>
        ) : (
          <Fragment key={`${index}-${part.text}`}>{part.text}</Fragment>
        )
      )}
    </p>
  );
}

function FaqPage({ onNavigate }: FaqPageProps) {
  return (
    <main className="faq-page" id="main-content" tabIndex={-1}>
      <DecorativeLayer className="faq-page__peripheral-art">
        <FloralCornerDecoration />
        <ProgressiveImage
          {...weddingImageAssets.discoBall}
          alt=""
          className="faq-page__disco-ball"
          draggable={false}
        />
      </DecorativeLayer>

      <ContentFrame className="faq-page__frame">
        <header className="faq-page__intro">
          <h1 className="guest-page-heading">Frequently asked questions</h1>
          <p>A few helpful answers as you plan to celebrate with us.</p>
        </header>

        {faqSections.map((section) => {
          const headingId = `${section.id}-heading`;

          return (
            <section
              aria-labelledby={headingId}
              className="faq-page__section"
              key={section.id}
            >
              <h2 className="guest-section-heading" id={headingId}>
                {section.title}
              </h2>
              <div className="faq-page__questions">
                {section.questions.map((question) => (
                  <div className="faq-page__question" key={question.id}>
                    <h3 id={question.id}>{question.question}</h3>
                    <FaqAnswer
                      onNavigate={onNavigate}
                      parts={question.answer}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <section
          aria-labelledby={`${faqHelp.id}-heading`}
          className="faq-page__section faq-page__help"
        >
          <h2 className="guest-section-heading" id={`${faqHelp.id}-heading`}>
            {faqHelp.title}
          </h2>
          <p>{faqHelp.answer}</p>
        </section>

        <footer className="faq-page__footer">
          <div className="faq-page__floral-divider">
            <DecorativeLayer>
              <ProgressiveImage
                {...weddingImageAssets.floralVineDivider}
                alt=""
                draggable={false}
              />
            </DecorativeLayer>
          </div>
          <a
            className="faq-page__home-link"
            href={homeDestination.path}
            onClick={(event) => onNavigate(event, homeDestination)}
          >
            Back to Home
          </a>
        </footer>
      </ContentFrame>
    </main>
  );
}

export { FaqPage, type FaqPageProps };
