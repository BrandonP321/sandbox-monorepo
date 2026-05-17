import type * as React from "react";

import { ActionsContainer } from "../ActionsContainer";
import { ContentHeader } from "../ContentHeader";
import { GlassContainer } from "../GlassContainer";
import { LinkedInButton } from "../LinkedInButton";
import { ResumeButton } from "../ResumeButton";
import amazonLogoUrl from "./assets/amazon-logo.png";
import awsLogoUrl from "./assets/aws-logo.png";
import bungieLogoUrl from "./assets/bungie-logo.png";
import startupLogoUrl from "./assets/startup-logo.png";

type ExperienceSectionNativeProps = Pick<
  React.ComponentProps<"section">,
  "className" | "id"
>;

type ExperienceItem = {
  company: string;
  dates: string;
  logoAlt: string;
  logoSrc: string;
  role: string;
  summary: string;
};

type ExperienceSectionProps = ExperienceSectionNativeProps;

const experienceItems = [
  {
    company: "Amazon",
    dates: "Dec 2024 - Present",
    logoAlt: "Amazon logo",
    logoSrc: amazonLogoUrl,
    role: "Frontend Engineer II",
    summary:
      "I lead frontend development for internal policy and workflow tools that help non-technical business users manage complex, rules-driven operations with less engineering support. My work has focused on turning brittle manual processes into scalable self-service systems while improving frontend architecture, reusable infrastructure, performance, and cross-team engineering standards."
  },
  {
    company: "Startup",
    dates: "Dec 2023 - Aug 2024",
    logoAlt: "Startup logo",
    logoSrc: startupLogoUrl,
    role: "Full Stack Engineer",
    summary:
      "I co-founded and built a full-stack wedding-planning platform focused on bringing real-time pricing and availability transparency to a fragmented planning process. I owned the product and technical foundation across React, TypeScript, Node.js, AWS, and relational data infrastructure, translating an early business concept into a working cloud-based application."
  },
  {
    company: "AWS",
    dates: "Jan 2023 - Feb 2024",
    logoAlt: "AWS logo",
    logoSrc: awsLogoUrl,
    role: "Frontend Engineer",
    summary:
      "I delivered user-facing improvements for the AWS Web Application Firewall console, with work spanning accessibility compliance, deployment automation, performance visibility, and UX improvements for a high-scale security product."
  },
  {
    company: "Bungie",
    dates: "mar 2021 - Sept 2022",
    logoAlt: "Bungie logo",
    logoSrc: bungieLogoUrl,
    role: "Web Developer",
    summary:
      "I served as the primary web developer for Bungie’s marketing organization, building campaign and product web experiences while supporting analytics-driven experimentation."
  }
] satisfies ExperienceItem[];

function ExperienceSection({ className, id }: ExperienceSectionProps) {
  return (
    <section
      aria-labelledby="portfolio-experience-title"
      className={["portfolio-experience-section", className]
        .filter(Boolean)
        .join(" ")}
      data-slot="experience-section"
      id={id}
    >
      <GlassContainer className="portfolio-experience-section__panel">
        <ContentHeader
          actions={
            <ActionsContainer>
              <LinkedInButton variant="primary" />
              <ResumeButton />
            </ActionsContainer>
          }
          alignActions="top"
          className="portfolio-experience-section__header"
          description="I’ve built frontend systems across Amazon, AWS, Bungie, and early-stage startup work—turning complex product requirements into scalable React and TypeScript experiences that improve workflows, reduce operational friction, and make teams more effective."
          headingLevel={2}
          title={<span id="portfolio-experience-title">Experience</span>}
        />

        <ol className="portfolio-experience-timeline">
          {experienceItems.map((item) => (
            <ExperienceTimelineItem item={item} key={item.company} />
          ))}
        </ol>
      </GlassContainer>
    </section>
  );
}

function ExperienceTimelineItem({ item }: { item: ExperienceItem }) {
  const headingId = `portfolio-experience-${item.company
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <li className="portfolio-experience-timeline__item">
      <div className="portfolio-experience-timeline__marker">
        <img
          alt={item.logoAlt}
          className="portfolio-experience-timeline__logo"
          src={item.logoSrc}
        />
      </div>

      <article
        aria-labelledby={headingId}
        className="portfolio-experience-timeline__content"
      >
        <p className="portfolio-experience-timeline__dates">{item.dates}</p>
        <h3 id={headingId}>
          {item.role} — {item.company}
        </h3>
        <p>{item.summary}</p>
      </article>
    </li>
  );
}

export { ExperienceSection, type ExperienceSectionProps };
