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
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod at ipsum sed sodales. Aliquam dapibus faucibus libero, eget ultricies nibh. Proin lorem augue, gravida at interdum at, varius vel mauris."
          id="intro"
          title="Brandon Phillips"
        />

        <ExperienceSection id="experience" />

        <SectionSpacer />

        <LatestProjectSection id="latest-project" />
      </main>
    </>
  );
}

function SectionSpacer() {
  return <div style={{ height: "40vh" }} />;
}
