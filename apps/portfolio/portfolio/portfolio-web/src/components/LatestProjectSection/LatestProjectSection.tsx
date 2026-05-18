import type * as React from "react";

import { ActionsContainer } from "../ActionsContainer";
import { ContentHeader } from "../ContentHeader";
import { GlassButtonLink, type GlassButtonLinkProps } from "../GlassButtonLink";
import { GlassContainer } from "../GlassContainer";
import {
  EvidenceBackedEntriesDetail,
  LivingAssessmentsDetail,
  ReviewProvenanceWorkflowDetail,
  TopicDossiersDetail
} from "./ProjectFeatureDetails";
import {
  AiOrchestratedWorkflowDetail,
  AwsNativeDeliveryStackDetail,
  FrontendPlatformDetail,
  FullStackContractsDetail
} from "./ProjectHighlightDetails";
import { ProjectDetailDialog } from "./ProjectDetailDialog";

type LatestProjectSectionNativeProps = Pick<
  React.ComponentProps<"section">,
  "className" | "id"
>;

type LatestProjectSectionProps = LatestProjectSectionNativeProps;

type ProjectHighlightCardData = {
  description: string;
  Detail: React.ComponentType;
  eyebrow: string;
  id: string;
  title: string;
};

const implementationHighlights = [
  {
    description:
      "Human-directed AI turns product docs, issue specs, and Codex tasks into a repeatable delivery loop.",
    Detail: AiOrchestratedWorkflowDetail,
    eyebrow: "Workflow",
    id: "signal-tracker-workflow",
    title: "AI-Orchestrated Workflow"
  },
  {
    description:
      "Shared contracts keep API routes, requests, responses, and validation aligned across frontend and backend.",
    Detail: FullStackContractsDetail,
    eyebrow: "Contracts",
    id: "signal-tracker-contracts",
    title: "Bone-DRY Full-Stack Contracts"
  },
  {
    description:
      "Reusable UI primitives, form patterns, and server-state conventions make product screens faster to build.",
    Detail: FrontendPlatformDetail,
    eyebrow: "Frontend platform",
    id: "signal-tracker-frontend-platform",
    title: "Bone-DRY Frontend Platform"
  },
  {
    description:
      "CDK-managed AWS infrastructure deploys the web app, Lambda API, and Aurora PostgreSQL backend.",
    Detail: AwsNativeDeliveryStackDetail,
    eyebrow: "AWS delivery",
    id: "signal-tracker-infrastructure",
    title: "AWS-Native Delivery Stack"
  }
] satisfies ProjectHighlightCardData[];

const featureHighlights = [
  {
    description:
      "Structured issue workspaces for tracking public-affairs topics without turning them into generic notes.",
    Detail: TopicDossiersDetail,
    eyebrow: "Workspace model",
    id: "signal-tracker-topic-dossiers",
    title: "Topic Dossiers"
  },
  {
    description:
      "Timeline entries preserve events, judgments, review notes, source URLs, and citation context together.",
    Detail: EvidenceBackedEntriesDetail,
    eyebrow: "Evidence trail",
    id: "signal-tracker-evidence-backed-entries",
    title: "Evidence-Backed Entries"
  },
  {
    description:
      "Current judgments stay visible while prior assessments, confidence, assumptions, and indicators remain preserved.",
    Detail: LivingAssessmentsDetail,
    eyebrow: "Judgment record",
    id: "signal-tracker-living-assessments",
    title: "Living Assessments"
  },
  {
    description:
      "Review loops, filters, revision history, and exports preserve continuity after time away.",
    Detail: ReviewProvenanceWorkflowDetail,
    eyebrow: "Continuity workflow",
    id: "signal-tracker-review-provenance",
    title: "Review & Provenance Workflow"
  }
] satisfies ProjectHighlightCardData[];

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
              <ProjectLink
                variant="primary"
                href="https://signal-tracker.bphillips.dev/"
              >
                Live App
              </ProjectLink>
              <ProjectLink href="https://dashboard-ui.bphillips.dev">
                UI System
              </ProjectLink>
              <ProjectLink href="https://github.com/BrandonP321/sandbox-monorepo/tree/main/apps/analysis/signal-tracker">
                Codebase
              </ProjectLink>
              <ProjectLink href="https://drive.google.com/drive/folders/16VAZNP9MZSc_yKdZP1shB3ofi0jhPF2e">
                Documentation
              </ProjectLink>
            </ActionsContainer>
          }
          alignActions="top"
          className="portfolio-latest-project-section__header"
          description="A full-stack web app for maintaining evidence-backed continuity on public-affairs topics—tracking what happened, what supports it, and how assessments change over time."
          eyebrow="Latest personal project"
          headingLevel={2}
          title={
            <span id="portfolio-latest-project-title">Signal Tracker</span>
          }
        />

        <ProjectHighlightSubsection
          highlights={featureHighlights}
          id="signal-tracker-features"
          title="Product Features"
          description="Signal Tracker is designed for long-running issues where context, evidence, and judgment history matter more than another news feed."
        />
        <ProjectHighlightSubsection
          highlights={implementationHighlights}
          id="signal-tracker-highlights"
          title="Engineering Highlights"
          description="Signal Tracker is built as a modern TypeScript monorepo with shared contracts, reusable UI infrastructure, AWS-native deployment, and an AI-assisted development workflow."
        />
      </GlassContainer>
    </section>
  );
}

function ProjectLink({
  variant = "secondary",
  ...props
}: Pick<GlassButtonLinkProps, "href" | "children" | "variant">) {
  return (
    <GlassButtonLink
      {...props}
      variant={variant}
      rel="noreferrer"
      target="_blank"
    />
  );
}

function ProjectHighlightSubsection({
  highlights,
  id,
  title,
  description
}: {
  highlights: ProjectHighlightCardData[];
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <ContentHeader
        className="portfolio-latest-project-section__highlight-header"
        headingLevel={3}
        title={title}
        description={description}
      />
      <div className="portfolio-project-highlight-grid" id={id}>
        {highlights.map((highlight) => (
          <ProjectHighlightCard highlight={highlight} key={highlight.id} />
        ))}
      </div>
    </div>
  );
}

function ProjectHighlightCard({
  highlight
}: {
  highlight: ProjectHighlightCardData;
}) {
  const headingId = `${highlight.id}-title`;
  const { Detail } = highlight;

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
        <Detail />
      </ProjectDetailDialog>
    </article>
  );
}

export { LatestProjectSection, type LatestProjectSectionProps };
