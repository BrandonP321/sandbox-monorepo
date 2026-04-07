import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "../Button/Button";
import styles from "./PageHeader.module.scss";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders page identity, actions, and tools in a compact shared structure", () => {
    const markup = renderToStaticMarkup(
      <PageHeader
        actions={<Button variant="primary">Export</Button>}
        breadcrumbs={
          <nav aria-label="Breadcrumb">
            <ol>
              <li>Workspace</li>
              <li>Briefings</li>
            </ol>
          </nav>
        }
        description="Shared page-level controls and identity for analyst workspaces."
        eyebrow="Quarterly briefing"
        title="Port of Los Angeles"
        tools={<Button>Filters</Button>}
      />
    );

    expect(markup).toContain(styles.root);
    expect(markup).toContain(styles.topRow);
    expect(markup).toContain(styles.identity);
    expect(markup).toContain(styles.breadcrumbs);
    expect(markup).toContain(styles.eyebrow);
    expect(markup).toContain(styles.title);
    expect(markup).toContain(styles.description);
    expect(markup).toContain(styles.actions);
    expect(markup).toContain(styles.tools);
    expect(markup).toContain("<header");
    expect(markup).toContain("<h1");
    expect(markup).toContain("Port of Los Angeles");
    expect(markup).toContain("Quarterly briefing");
    expect(markup).toContain("Export");
    expect(markup).toContain("Filters");
  });

  it("renders breadcrumbs before the page heading", () => {
    const markup = renderToStaticMarkup(
      <PageHeader breadcrumbs={<nav aria-label="Breadcrumb">Crumbs</nav>} title="Signals" />
    );

    expect(markup.indexOf("Crumbs")).toBeLessThan(markup.indexOf("Signals"));
  });

  it("omits optional regions that are not provided", () => {
    const markup = renderToStaticMarkup(<PageHeader title="Overview" />);

    expect(markup).toContain(styles.root);
    expect(markup).toContain(styles.title);
    expect(markup).not.toContain(styles.breadcrumbs);
    expect(markup).not.toContain(styles.eyebrow);
    expect(markup).not.toContain(styles.description);
    expect(markup).not.toContain(styles.actions);
    expect(markup).not.toContain(styles.tools);
  });

  it("does not render actions when they are not provided", () => {
    const markup = renderToStaticMarkup(
      <PageHeader breadcrumbs={<div>Path</div>} title="Signals" />
    );

    expect(markup).not.toContain(styles.actions);
  });
});
