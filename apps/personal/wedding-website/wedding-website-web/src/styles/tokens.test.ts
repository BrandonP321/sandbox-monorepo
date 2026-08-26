import { describe, expect, it } from "vitest";

import mainSource from "../main.tsx?raw";
import fontsCss from "./fonts.css?raw";
import tokensCss from "./tokens.css?inline";

const normalizedTokensCss = tokensCss.replaceAll(/\s+/g, " ");

const approvedColors = {
  "--color-paper": "#fcfbf8",
  "--color-paper-warm": "#f8f0e5",
  "--color-ink": "#332f27",
  "--color-olive": "#615610",
  "--color-olive-soft": "#7a722d",
  "--color-coral-action": "#c84c35",
  "--color-coral-art": "#e5966f",
  "--color-pink": "#f4c6c6",
  "--color-dusty-blue": "#aec7e6",
  "--color-marigold": "#e6a044",
  "--color-sage": "#b7c4ab",
  "--color-focus": "#456b8a",
  "--color-error": "#a94442"
} as const;

const spacingScale = {
  "--space-4": "0.25rem",
  "--space-8": "0.5rem",
  "--space-12": "0.75rem",
  "--space-16": "1rem",
  "--space-24": "1.5rem",
  "--space-32": "2rem",
  "--space-48": "3rem",
  "--space-64": "4rem"
} as const;

describe("wedding design tokens", () => {
  it("keeps the approved palette and spacing scale centralized", () => {
    for (const [token, value] of Object.entries({
      ...approvedColors,
      ...spacingScale
    })) {
      expect(tokensCss).toContain(`${token}: ${value};`);
    }
  });

  it("keeps width and finalized font roles centralized", () => {
    expect(tokensCss).toContain("--content-width-form: 46rem;");
    expect(tokensCss).toContain("--content-width-hero: 70rem;");
    expect(normalizedTokensCss).toContain(
      '--font-display: "Lora", Georgia, "Times New Roman", serif;'
    );
    expect(normalizedTokensCss).toContain(
      '--font-script: "Lovers in New York", "Snell Roundhand", "Brush Script MT", cursive;'
    );
    expect(normalizedTokensCss).toContain(
      '--font-ui: "Lora", Georgia, "Times New Roman", serif;'
    );
  });

  it("loads the production font assets for every used weight", () => {
    expect(mainSource).toContain('import "@fontsource/lora/latin-400.css";');
    expect(mainSource).toContain('import "@fontsource/lora/latin-700.css";');
    expect(fontsCss).toContain('font-family: "Lovers in New York";');
    expect(fontsCss).toContain(
      'url("../assets/fonts/lovers-in-new-york-regular.woff2")'
    );
    expect(fontsCss).toContain(
      'url("../assets/fonts/lovers-in-new-york-bold.woff2")'
    );
    expect(fontsCss.match(/font-display: swap;/g)).toHaveLength(2);
  });
});
