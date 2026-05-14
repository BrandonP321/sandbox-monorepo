import { PageSeo } from "@repo/ui-base/seo";

import { HeroSection } from "./components";

const placeholderSections = [
  {
    body: "Placeholder copy for future project and experience detail. This block is here to test how the black hole continues below the fold.",
    id: "experience",
    title: "Experience"
  },
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

export default function App() {
  return (
    <>
      <PageSeo
        description="Portfolio for Brandon Phillips: experience, projects, and writing."
        title="Portfolio"
        titleSuffix="Brandon Phillips"
      />
      <main className="portfolio-page">
        <HeroSection
          description="Built to capture ideas instantly, connect insights intelligently, and clarify complex thinking, Reflect transforms the way you work with information."
          title="Transform The Way You Think With Loopy"
        />

        <section
          aria-label="Portfolio preview content"
          className="portfolio-scroll-preview"
        >
          <div className="portfolio-scroll-preview__header">
            <p className="portfolio-scroll-preview__eyebrow">Placeholder</p>
            <h2>Below the fold</h2>
            <p>
              Temporary content for reviewing how the hero graphic reveals
              itself while scrolling.
            </p>
          </div>

          <div className="portfolio-grid">
            {placeholderSections.map((section) => (
              <article
                aria-labelledby={`${section.id}-title`}
                className="portfolio-section"
                id={section.id}
                key={section.id}
              >
                <h3 id={`${section.id}-title`}>{section.title}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
