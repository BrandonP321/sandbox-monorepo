import { PageSeo } from "@repo/ui-base/seo";

const portfolioSections = [
  {
    body: "Public affairs, analytics, and software delivery across early-stage product surfaces.",
    id: "experience",
    title: "Experience"
  },
  {
    body: "Signal Tracker and other focused tools built from the sandbox monorepo.",
    id: "projects",
    title: "Projects"
  },
  {
    body: "Notes on product judgment, policy workflows, and pragmatic engineering decisions.",
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
      <main className="portfolio-shell">
        <section aria-labelledby="portfolio-title" className="portfolio-hero">
          <p className="portfolio-kicker">Portfolio</p>
          <h1 id="portfolio-title">Brandon Phillips</h1>
          <p className="portfolio-summary">
            Building analysis tools, policy workflows, and pragmatic product
            systems.
          </p>
          <nav aria-label="Portfolio sections" className="portfolio-nav">
            {portfolioSections.map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                {section.title}
              </a>
            ))}
          </nav>
        </section>

        <section aria-label="Portfolio overview" className="portfolio-grid">
          {portfolioSections.map((section) => (
            <article
              aria-labelledby={`${section.id}-title`}
              className="portfolio-section"
              id={section.id}
              key={section.id}
            >
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
