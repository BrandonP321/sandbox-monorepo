import { PageSeo } from "@repo/ui-base/seo";

import {
  ContentHeader,
  ExperienceSection,
  GlassButton,
  GlassContainer,
  HeroSection
} from "./components";

const placeholderSections = [
  {
    body: "A temporary project surface for checking scroll pacing, section spacing, and how cards sit beneath the hero graphic.",
    id: "projects",
    title: "Projects"
  },
  {
    body: "Room for writing, notes, or case-study entries once the portfolio content direction is ready.",
    id: "writing",
    title: "Writing"
  }
] as const;

const placeholderSectionInstances = [
  { ariaLabel: "Portfolio preview content", id: "preview-1" }
] as const;

export default function App() {
  return (
    <>
      <PageSeo
        description="Portfolio for Brandon Phillips: experience, projects, and writing."
        title="Portfolio"
        titleSuffix="Brandon Phillips"
      />
      <main className="portfolio-page" data-slot="portfolio-scroll-container">
        <HeroSection
          description="Built to capture ideas instantly, connect insights intelligently, and clarify complex thinking, Reflect transforms the way you work with information."
          title="Brandon Phillips"
        />

        <ExperienceSection />

        {placeholderSectionInstances.map((section) => (
          <PlaceholderSection
            ariaLabel={section.ariaLabel}
            idPrefix={section.id}
            key={section.id}
          />
        ))}
      </main>
    </>
  );
}

type PlaceholderSectionProps = {
  ariaLabel: string;
  idPrefix: string;
};

function PlaceholderSection({ ariaLabel, idPrefix }: PlaceholderSectionProps) {
  return (
    <section aria-label={ariaLabel} className="portfolio-scroll-preview">
      <div
        style={{
          display: "flex",
          gap: "1rem",
          paddingBottom: "2rem",
          justifyContent: "end"
        }}
      >
        <GlassButton variant="primary">Primary</GlassButton>
        <GlassButton variant="secondary">Secondary</GlassButton>
      </div>
      <GlassContainer>
        <ContentHeader
          title="Below the fold"
          headingLevel={2}
          description="Temporary content for reviewing how the hero graphic reveals itself while scrolling."
        />

        <div className="portfolio-grid">
          {placeholderSections.map((section) => {
            const sectionId = `${idPrefix}-${section.id}`;
            const headingId = `${sectionId}-title`;

            return (
              <article
                aria-labelledby={headingId}
                className="portfolio-section"
                id={sectionId}
                key={section.id}
              >
                <h3 id={headingId}>{section.title}</h3>
                <p>{section.body}</p>
              </article>
            );
          })}
        </div>
      </GlassContainer>
    </section>
  );
}
