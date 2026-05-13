import { describe, expect, it } from "vitest";

import { getGoogleFaviconUrl, getUrlHostname } from "./url";

describe("url helpers", () => {
  it("extracts hostnames from absolute URLs", () => {
    expect(getUrlHostname("https://agency.example/report")).toBe(
      "agency.example"
    );
  });

  it("normalizes bare hostnames before parsing", () => {
    expect(getUrlHostname("agency.example/report")).toBe("agency.example");
  });

  it("returns undefined for empty or invalid URLs", () => {
    expect(getUrlHostname(undefined)).toBeUndefined();
    expect(getUrlHostname("http://")).toBeUndefined();
  });

  it("builds Google favicon URLs from parsed hostnames", () => {
    expect(getGoogleFaviconUrl("agency.example/report")).toBe(
      "https://www.google.com/s2/favicons?domain=agency.example&sz=32"
    );
  });
});
