import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Masthead } from "../Masthead/Masthead";
import { SidebarNav } from "../SidebarNav/SidebarNav";
import styles from "./AppShell.module.scss";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders shell landmarks with structural sidebar and aside regions", () => {
    const markup = renderToStaticMarkup(
      <AppShell
        aside={<div>Related context</div>}
        masthead={<div>Workspace masthead</div>}
        sidebar={<div>Primary navigation</div>}
      >
        <div>Report workspace</div>
      </AppShell>
    );

    expect(markup).toContain(styles.root);
    expect(markup).toContain(styles.skipLink);
    expect(markup).toContain(styles.masthead);
    expect(markup).toContain(styles.body);
    expect(markup).toContain(styles.main);
    expect(markup).toContain(styles.sidebar);
    expect(markup).toContain(styles.aside);
    expect(markup).toContain("<header");
    expect(markup).toContain("<main");
    expect(markup).toContain("Skip to main content");

    const hrefMatch = markup.match(/href="#([^"]+)"/);
    const mainIdMatch = markup.match(/<main[^>]*id="([^"]+)"/);

    expect(hrefMatch?.[1]).toBeTruthy();
    expect(mainIdMatch?.[1]).toBe(hrefMatch?.[1]);
  });

  it("supports prop-driven overlay rails and preserves an explicit main id", () => {
    const markup = renderToStaticMarkup(
      <AppShell
        aside={<div>Related context</div>}
        asideMode="overlay"
        asideOpen
        mainId="workspace-main"
        sidebar={<div>Primary navigation</div>}
        sidebarMode="overlay"
        sidebarOpen
        skipLinkLabel="Skip to workspace"
      >
        <div>Report workspace</div>
      </AppShell>
    );

    expect(markup).toContain('href="#workspace-main"');
    expect(markup).toContain('id="workspace-main"');
    expect(markup).toContain(styles.overlayLayer);
    expect(markup).toContain(styles.overlayPanel);
    expect(markup).toContain(styles.overlayLeft);
    expect(markup).toContain(styles.overlayRight);
    expect(markup).toContain(styles.overlay);
    expect(markup).toContain("Skip to workspace");
  });

  it("provides shell context to coordinated masthead and sidebar primitives", () => {
    const markup = renderToStaticMarkup(
      <AppShell
        masthead={<Masthead sidebarToggle title="Analyst Workspace" />}
        sidebar={
          <SidebarNav
            aria-label="Primary navigation"
            sections={[
              {
                items: [{ active: true, href: "/overview", label: "Overview" }]
              }
            ]}
          />
        }
      >
        <div>Report workspace</div>
      </AppShell>
    );

    const controlsMatch = markup.match(/aria-controls="([^"]+)"/);
    const idMatch = markup.match(/<nav[^>]*id="([^"]+)"/);

    expect(controlsMatch?.[1]).toBeTruthy();
    expect(idMatch?.[1]).toBe(controlsMatch?.[1]);
    expect(markup).toContain('aria-expanded="true"');
  });

  it("omits overlay rails when they are not provided", () => {
    const markup = renderToStaticMarkup(
      <AppShell masthead={<div>Workspace masthead</div>}>
        <div>Report workspace</div>
      </AppShell>
    );

    expect(markup).not.toContain(styles.sidebar);
    expect(markup).not.toContain(styles.aside);
    expect(markup).toContain("<main");
  });
});
