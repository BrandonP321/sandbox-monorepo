import { PageSeo } from "@repo/ui-base/seo";

import {
  ExperienceSection,
  HeroSection,
  LatestProjectSection,
  StickyNav
} from "./components";
import resumePdfUrl from "./components/ResumeButton/assets/resume.pdf";

const portfolioNavItems = [
  { href: "#experience", label: "Experience", openInNewTab: false },
  { href: "#latest-project", label: "Project", openInNewTab: false },
  { href: resumePdfUrl, label: "Resume", openInNewTab: true }
] as const;

export default function App() {
  return (
    <>
      <PageSeo
        description="Portfolio for Brandon Phillips: experience and projects."
        title="Portfolio"
        titleSuffix="Brandon Phillips"
      />
      <main className="portfolio-page" data-slot="portfolio-scroll-container">
        <StickyNav items={portfolioNavItems} />

        <HeroSection
          description="Built to capture ideas instantly, connect insights intelligently, and clarify complex thinking, Reflect transforms the way you work with information."
          id="intro"
          title="Brandon Phillips"
        />

        <ExperienceSection id="experience" />

        <LatestProjectSection id="latest-project" />
      </main>
    </>
  );
}
