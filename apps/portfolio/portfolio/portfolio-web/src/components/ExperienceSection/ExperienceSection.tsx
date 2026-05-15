import type * as React from "react";

import { ContentHeader } from "../ContentHeader";
import { GlassContainer } from "../GlassContainer";
import amazonLogoUrl from "./assets/amazon-logo.png";
import awsLogoUrl from "./assets/aws-logo.png";
import bungieLogoUrl from "./assets/bungie-logo.png";
import startupLogoUrl from "./assets/startup-logo.png";

type ExperienceSectionNativeProps = Pick<
  React.ComponentProps<"section">,
  "className"
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
    company: "AWS",
    dates: "2024 - Present",
    logoAlt: "AWS logo",
    logoSrc: awsLogoUrl,
    role: "Software Development Engineer",
    summary:
      "Placeholder experience summary for cloud product engineering, platform workflows, and production systems."
  },
  {
    company: "Amazon",
    dates: "2022 - 2024",
    logoAlt: "Amazon logo",
    logoSrc: amazonLogoUrl,
    role: "Software Development Engineer",
    summary:
      "Placeholder experience summary for customer-focused product delivery, operational tooling, and cross-functional engineering."
  },
  {
    company: "Bungie",
    dates: "2020 - 2022",
    logoAlt: "Bungie logo",
    logoSrc: bungieLogoUrl,
    role: "Software Engineer",
    summary:
      "Placeholder experience summary for service reliability, developer workflows, and collaborative product support."
  },
  {
    company: "Startup",
    dates: "2018 - 2020",
    logoAlt: "Startup logo",
    logoSrc: startupLogoUrl,
    role: "Full Stack Engineer",
    summary:
      "Placeholder experience summary for early-stage product development, rapid prototyping, and pragmatic application delivery."
  }
] satisfies ExperienceItem[];

function ExperienceSection({ className }: ExperienceSectionProps) {
  return (
    <section
      aria-labelledby="portfolio-experience-title"
      className={["portfolio-experience-section", className]
        .filter(Boolean)
        .join(" ")}
      data-slot="experience-section"
    >
      <GlassContainer className="portfolio-experience-section__panel">
        <ContentHeader
          className="portfolio-experience-section__header"
          description="A brief timeline of engineering roles, with placeholder details until the final copy is ready."
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
          {item.role} - {item.company}
        </h3>
        <p>{item.summary}</p>
      </article>
    </li>
  );
}

export { ExperienceSection, type ExperienceSectionProps };
