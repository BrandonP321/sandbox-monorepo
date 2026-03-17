import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppShell } from "../AppShell/AppShell";
import styles from "./Masthead.module.scss";
import { Masthead } from "./Masthead";

describe("Masthead", () => {
  it("renders the expected left, center, and right zones", () => {
    const markup = renderToStaticMarkup(
      <Masthead
        actions={<button aria-label="Open notifications">Alerts</button>}
        center={<div>Search slot</div>}
        label="Production"
        start={<button aria-label="Open navigation">Menu</button>}
        title="Analyst Workspace"
      />
    );

    expect(markup).toContain(styles.root);
    expect(markup).toContain(styles.hasCenter);
    expect(markup).toContain(styles.left);
    expect(markup).toContain(styles.start);
    expect(markup).toContain(styles.titleBlock);
    expect(markup).toContain(styles.label);
    expect(markup).toContain(styles.title);
    expect(markup).toContain(styles.center);
    expect(markup).toContain(styles.actions);
    expect(markup).toContain("Production");
    expect(markup).toContain("Analyst Workspace");
    expect(markup).toContain("Search slot");
    expect(markup).toContain("Open notifications");
  });

  it("omits optional zones that are not provided", () => {
    const markup = renderToStaticMarkup(<Masthead title="Analyst Workspace" />);

    expect(markup).toContain(styles.root);
    expect(markup).not.toContain(styles.hasCenter);
    expect(markup).toContain(styles.left);
    expect(markup).toContain(styles.title);
    expect(markup).not.toContain(styles.start);
    expect(markup).not.toContain(styles.center);
    expect(markup).not.toContain(styles.actions);
  });

  it("passes zone props through to the matching wrappers", () => {
    const markup = renderToStaticMarkup(
      <Masthead
        actions={<button aria-label="Open notifications">Alerts</button>}
        actionsProps={{ "data-zone": "actions" }}
        center={<div>Search slot</div>}
        centerProps={{ "data-zone": "center" }}
        label="Production"
        labelProps={{ "data-zone": "label" }}
        start={<button aria-label="Open navigation">Menu</button>}
        startProps={{ "data-zone": "start" }}
        title="Analyst Workspace"
        titleProps={{ "data-zone": "title" }}
      />
    );

    expect(markup).toContain('data-zone="start"');
    expect(markup).toContain('data-zone="label"');
    expect(markup).toContain('data-zone="title"');
    expect(markup).toContain('data-zone="center"');
    expect(markup).toContain('data-zone="actions"');
  });

  it("renders a coordinated sidebar toggle when used inside AppShell", () => {
    const markup = renderToStaticMarkup(
      <AppShell
        masthead={<Masthead sidebarToggle title="Analyst Workspace" />}
        sidebar={<div>Primary navigation</div>}
      >
        <div>Workspace</div>
      </AppShell>
    );

    expect(markup).toContain(styles.controlButton);
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("Collapse navigation");
  });
});
