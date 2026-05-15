import type * as React from "react";

import { ActionsContainer } from "../ActionsContainer";
import { ContentHeader } from "../ContentHeader";
import { GlassButtonLink } from "../GlassButtonLink";
import { GlassContainer } from "../GlassContainer";
import { ProjectDetailDialog } from "./ProjectDetailDialog";

type LatestProjectSectionNativeProps = Pick<
  React.ComponentProps<"section">,
  "className" | "id"
>;

type LatestProjectSectionProps = LatestProjectSectionNativeProps;

type ProjectHighlight = {
  description: string;
  detail: string;
  eyebrow: string;
  id: string;
  title: string;
};

const projectHighlights = [
  {
    description:
      "Short placeholder copy for the main product problem this project solves.",
    detail:
      "Longer placeholder detail for the product thinking, workflow design, and tradeoffs behind this highlight.",
    eyebrow: "Product system",
    id: "signal-tracker-workflow",
    title: "Signal Tracker workflow"
  },
  {
    description:
      "Short placeholder copy for the app architecture and interaction model.",
    detail:
      "Longer placeholder detail for the frontend structure, API contracts, and reviewable boundaries behind this highlight.",
    eyebrow: "Application design",
    id: "signal-tracker-architecture",
    title: "Composable app architecture"
  },
  {
    description:
      "Short placeholder copy for the infrastructure and delivery work behind the app.",
    detail:
      "Longer placeholder detail for deployment, validation, observability, and operational safeguards behind this highlight.",
    eyebrow: "Infrastructure",
    id: "signal-tracker-infrastructure",
    title: "Production-style infrastructure"
  },
  {
    description:
      "Short placeholder copy for evidence, citations, and complex data relationships.",
    detail:
      "Longer placeholder detail for data modeling, source capture, and traceability patterns behind this highlight.",
    eyebrow: "Data model",
    id: "signal-tracker-evidence",
    title: "Evidence-first analysis"
  }
] satisfies ProjectHighlight[];

function LatestProjectSection({ className, id }: LatestProjectSectionProps) {
  return (
    <section
      aria-labelledby="portfolio-latest-project-title"
      className={["portfolio-latest-project-section", className]
        .filter(Boolean)
        .join(" ")}
      data-slot="latest-project-section"
      id={id}
    >
      <GlassContainer className="portfolio-latest-project-section__panel">
        <ContentHeader
          actions={
            <ActionsContainer aria-label="Signal Tracker links">
              <GlassButtonLink
                href="#signal-tracker-workflow"
                variant="primary"
              >
                Highlights
              </GlassButtonLink>
              <GlassButtonLink
                href="#signal-tracker-infrastructure"
                variant="secondary"
              >
                Infrastructure
              </GlassButtonLink>
            </ActionsContainer>
          }
          alignActions="top"
          className="portfolio-latest-project-section__header"
          description="Placeholder introduction for the latest personal project, with room to describe why Signal Tracker is a useful proxy for professional work."
          eyebrow="Latest personal project"
          headingLevel={2}
          title={
            <span id="portfolio-latest-project-title">Signal Tracker</span>
          }
        />

        <div
          className="portfolio-project-highlight-grid"
          id="signal-tracker-highlights"
        >
          {projectHighlights.map((highlight) => (
            <ProjectHighlightCard highlight={highlight} key={highlight.id} />
          ))}
        </div>
      </GlassContainer>
    </section>
  );
}

function ProjectHighlightCard({ highlight }: { highlight: ProjectHighlight }) {
  const headingId = `${highlight.id}-title`;

  return (
    <article
      aria-labelledby={headingId}
      className="portfolio-project-highlight-card"
      id={highlight.id}
    >
      <p className="portfolio-project-highlight-card__eyebrow">
        {highlight.eyebrow}
      </p>
      <h3 id={headingId}>{highlight.title}</h3>
      <p>{highlight.description}</p>
      <ProjectDetailDialog
        description={highlight.description}
        eyebrow={highlight.eyebrow}
        title={highlight.title}
      >
        <p>{highlight.detail}</p>
      </ProjectDetailDialog>
    </article>
  );
}

export { LatestProjectSection, type LatestProjectSectionProps };
