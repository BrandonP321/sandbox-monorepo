import { statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import indexHtml from "../index.html?raw";

const SOCIAL_IMAGE_URL =
  "https://niamhandbrandon.com/social/wedding-social-preview.jpg";
const SOCIAL_IMAGE_ALT = "Niamh and Brandon’s wedding — August 21, 2027";
const PAGE_TITLE = "Niamh & Brandon’s Wedding";
const PAGE_DESCRIPTION =
  "Join us as we celebrate the wedding of Niamh and Brandon. Find wedding details, RSVP information, our registry, and everything you’ll need for the day.";

function parseIndexHtml() {
  return new DOMParser().parseFromString(indexHtml, "text/html");
}

function readMetaContent(attribute: "name" | "property", value: string) {
  return parseIndexHtml()
    .querySelector(`meta[${attribute}="${value}"]`)
    ?.getAttribute("content");
}

describe("static social metadata", () => {
  it("uses the approved title and description for browsers and social cards", () => {
    expect(parseIndexHtml().title).toBe(PAGE_TITLE);
    expect(readMetaContent("name", "description")).toBe(PAGE_DESCRIPTION);
    expect(readMetaContent("property", "og:title")).toBe(PAGE_TITLE);
    expect(readMetaContent("property", "og:description")).toBe(
      PAGE_DESCRIPTION
    );
    expect(readMetaContent("name", "twitter:title")).toBe(PAGE_TITLE);
    expect(readMetaContent("name", "twitter:description")).toBe(
      PAGE_DESCRIPTION
    );
    expect(indexHtml).not.toContain("Wedding Website Prototype");
    expect(indexHtml).not.toContain(
      "Wedding website frontend prototype scaffold."
    );
  });

  it("references the approved social card with complete image metadata", () => {
    expect(readMetaContent("property", "og:image")).toBe(SOCIAL_IMAGE_URL);
    expect(readMetaContent("property", "og:image:type")).toBe("image/jpeg");
    expect(readMetaContent("property", "og:image:width")).toBe("1200");
    expect(readMetaContent("property", "og:image:height")).toBe("630");
    expect(readMetaContent("property", "og:image:alt")).toBe(SOCIAL_IMAGE_ALT);
    expect(readMetaContent("name", "twitter:card")).toBe("summary_large_image");
    expect(readMetaContent("name", "twitter:image")).toBe(SOCIAL_IMAGE_URL);
    expect(readMetaContent("name", "twitter:image:alt")).toBe(SOCIAL_IMAGE_ALT);
  });

  it("keeps the social card in the stable public asset directory", () => {
    const socialImage = resolve(
      process.cwd(),
      "public/social/wedding-social-preview.jpg"
    );
    const socialImageSize = statSync(socialImage).size;

    expect(socialImageSize).toBeGreaterThan(0);
    expect(socialImageSize).toBeLessThan(200 * 1024);
  });
});
