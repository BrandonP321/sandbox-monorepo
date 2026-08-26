import { describe, expect, it } from "vitest";

import indexHtml from "../../index.html?raw";
import globalCss from "./global.css?raw";
import landingCss from "./landing.css?raw";

const normalizedLandingCss = landingCss.replaceAll(/\s+/g, " ");
const normalizedGlobalCss = globalCss.replaceAll(/\s+/g, " ");

describe("landing page surface", () => {
  it("inherits the application-wide cardboard overlay without duplicating it", () => {
    expect(landingCss).toContain("min-height: 100dvh;");
    expect(landingCss).toContain("background-color: var(--color-paper);");
    expect(landingCss).not.toContain(".landing-page::after");
    expect(normalizedGlobalCss).toContain("body::after { position: absolute;");
    expect(globalCss).toContain(
      'background-image: url("../assets/textures/cardboard-texture.png");'
    );
    expect(globalCss).toContain("z-index: 2147483647;");
    expect(globalCss).toContain("background-repeat: repeat;");
    expect(globalCss).toContain("opacity: 0.5;");
    expect(globalCss).toContain("pointer-events: none;");
  });

  it("extends the textured page canvas through iPhone safe-area insets", () => {
    expect(indexHtml).toContain("viewport-fit=cover");
    expect(normalizedGlobalCss).toContain(
      "html, body { background-color: var(--color-paper);"
    );
    expect(globalCss).toContain(
      'url("../assets/textures/cardboard-texture.png");'
    );
    expect(globalCss).toContain(
      "color-mix(in srgb, var(--color-paper) 50%, transparent)"
    );
    expect(globalCss).toContain("background-repeat: no-repeat, repeat;");
    expect(globalCss).toContain("min-height: 100dvh;");
    expect(landingCss).toContain("env(safe-area-inset-top)");
    expect(landingCss).toContain("env(safe-area-inset-bottom)");
  });

  it("removes the preview blur immediately when the full image is ready", () => {
    expect(normalizedGlobalCss).toContain(
      ".wedding-progressive-image { filter: blur(0); }"
    );
    expect(normalizedGlobalCss).toContain(
      '.wedding-progressive-image[data-image-resolution="low-res"] { filter: blur(0.25rem); }'
    );
    expect(globalCss).not.toContain("transition: filter");
  });

  it("keeps the mobile decorations around the RSVP action", () => {
    expect(normalizedLandingCss).toContain(
      ".landing-decoration--disco { top: -1.5rem; right: 0; width: 6rem; }"
    );
    expect(normalizedLandingCss).toMatch(
      /@media \(max-width: 30rem\) \{.*\.landing-decoration--floral \{ top: -0\.125rem; left: -2rem; width: 10rem; \}/
    );
    expect(normalizedLandingCss).toMatch(
      /@media \(min-width: 30rem\) \{.*\.landing-decoration--floral \{ top: -0\.125rem; left: -2rem; width: 14rem; \}/
    );
    expect(normalizedLandingCss).toContain(
      ".landing-decoration--cat { right: 0.25rem; bottom: 1rem; width: 5rem; }"
    );
    expect(normalizedLandingCss).toContain(
      ".landing-decoration--champagne { bottom: 1rem; left: 0.5rem; display: block; width: 5rem; }"
    );
    expect(normalizedLandingCss).toContain(
      "@media (max-width: 47.5rem) { .landing-decoration--champagne { left: 1rem; } .landing-decoration--cat { right: 1rem; bottom: 0.5rem; } }"
    );
    expect(normalizedLandingCss).toContain(
      "@media (max-width: 30rem) { .landing-decoration--floral { top: -0.125rem; left: -2rem; width: 10rem; } .landing-decoration--champagne { bottom: 1rem; left: 0.5rem; } .landing-decoration--cat { right: 0.25rem; bottom: 1rem; } }"
    );
    expect(landingCss).not.toContain("margin-block-start: auto;");
  });

  it("keeps both sparkle groups visible and clear of the mobile content", () => {
    expect(normalizedLandingCss).toContain(
      ".landing-decoration--sparkles-primary, .landing-decoration--sparkles-secondary { display: block; }"
    );
    expect(normalizedLandingCss).toContain(
      ".landing-decoration--sparkles-primary { top: 16rem; left: 0.75rem; width: 1.35rem; }"
    );
    expect(normalizedLandingCss).toMatch(
      /@media \(min-width: 30rem\) \{.*\.landing-decoration--sparkles-primary \{ top: 21rem;/
    );
    expect(normalizedLandingCss).toMatch(
      /@media \(min-width: 47\.5rem\) \{.*\.landing-decoration--sparkles-primary \{ top: 26rem;/
    );
    expect(normalizedLandingCss).toContain(
      ".landing-decoration--sparkles-secondary { top: 10.25rem; right: 0.75rem; width: 1.25rem; }"
    );
    expect(landingCss).not.toContain("display: none;");
  });

  it("reserves the script font for the couple names and wedding date", () => {
    expect(normalizedLandingCss).toMatch(
      /\.landing-page__names \{[^}]*font-family: var\(--font-script\);[^}]*font-size: clamp\(2\.75rem, 8vw, 4rem\);[^}]*letter-spacing: 0\.02em;[^}]*line-height: 0\.9;/
    );
    expect(normalizedLandingCss).toMatch(
      /\.landing-page__date \{[^}]*font-family: var\(--font-script\);[^}]*font-size: clamp\(1\.1rem, 3vw, 1\.5rem\);[^}]*letter-spacing: 0\.01em;[^}]*line-height: 1;[^}]*word-spacing: 0\.12em;[^}]*white-space: nowrap;/
    );
    expect(normalizedLandingCss).not.toMatch(
      /\.landing-page__names \{[^}]*text-transform: uppercase;/
    );
    expect(normalizedLandingCss).not.toMatch(
      /\.landing-page__welcome \{[^}]*font-family: var\(--font-script\);/
    );
  });

  it("reserves visual space around the script font's oversized swashes", () => {
    expect(normalizedLandingCss).toMatch(
      /\.landing-page__names \{[^}]*margin-block-start: clamp\( calc\(var\(--space-48\) \+ var\(--space-8\)\), 10vw, calc\(var\(--space-64\) \+ var\(--space-32\)\) \);/
    );
    expect(normalizedLandingCss).toMatch(
      /\.landing-page__date \{[^}]*margin-block-start: clamp\( calc\(var\(--space-48\) \+ var\(--space-8\)\), 9vw, calc\(var\(--space-64\) \+ var\(--space-16\)\) \);/
    );
    expect(normalizedLandingCss).toMatch(
      /\.landing-page__welcome \{[^}]*margin-block-start: calc\(var\(--space-32\) \+ var\(--space-8\)\);/
    );
  });
});
