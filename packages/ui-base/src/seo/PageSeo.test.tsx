// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageSeo } from "./PageSeo";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

describe("PageSeo", () => {
  it("sets the document title from the page title", () => {
    render(<PageSeo title="Topics" />);

    expect(document.title).toBe("Topics");
    expect(document.head.querySelector("title")?.textContent).toBe("Topics");
  });

  it("joins title affixes with the page title", () => {
    render(
      <PageSeo
        title="Topics"
        titlePrefix="Draft"
        titleSuffix="Signal Tracker"
      />
    );

    expect(document.title).toBe("Draft | Topics | Signal Tracker");
  });

  it("sets the meta description when one is provided", () => {
    render(
      <PageSeo
        description="Track continuity signals across topics."
        title="Topics"
      />
    );

    expect(
      document.head
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe("Track continuity signals across topics.");
  });

  it("omits the meta description when no description is provided", () => {
    render(<PageSeo title="Topics" />);

    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });
});
