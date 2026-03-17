import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Bell, FolderKanban, Gauge, Settings } from "../../../icons";
import styles from "./SidebarNav.module.scss";
import { SidebarNav } from "./SidebarNav";

const sections = [
  {
    label: "Workspace",
    items: [
      {
        active: true,
        href: "/overview",
        icon: Gauge,
        label: "Overview"
      },
      {
        href: "/projects",
        icon: FolderKanban,
        label: "Projects",
        children: [
          {
            href: "/projects/active",
            label: "Active"
          },
          {
            active: true,
            href: "/projects/archived",
            label: "Archived"
          }
        ]
      },
      {
        disabled: true,
        href: "/alerts",
        icon: Bell,
        label: "Alerts"
      }
    ]
  }
] as const;

describe("SidebarNav", () => {
  it("renders sections, items, and nested child items up to two levels", () => {
    const markup = renderToStaticMarkup(
      <SidebarNav aria-label="Primary navigation" sections={sections} />
    );

    expect(markup).toContain(styles.root);
    expect(markup).toContain(styles.expanded);
    expect(markup).toContain(styles.section);
    expect(markup).toContain(styles.sectionLabel);
    expect(markup).toContain(styles.itemControl);
    expect(markup).toContain(styles.childList);
    expect(markup).toContain("Primary navigation");
    expect(markup).toContain("Workspace");
    expect(markup).toContain("Overview");
    expect(markup).toContain("Projects");
    expect(markup).toContain("Archived");
    expect(markup).toContain('aria-current="page"');
  });

  it("supports collapsed mode and keeps icon-first items labeled", () => {
    const markup = renderToStaticMarkup(
      <SidebarNav
        aria-label="Primary navigation"
        mode="collapsed"
        sections={sections}
      />
    );

    expect(markup).toContain(styles.collapsed);
    expect(markup).toContain('title="Overview"');
    expect(markup).toContain(styles.srOnly);
    expect(markup).not.toContain(styles.sectionLabel);
    expect(markup).not.toContain(styles.childList);
  });

  it("renders overlay state and footer utilities", () => {
    const markup = renderToStaticMarkup(
      <SidebarNav
        aria-label="Primary navigation"
        footer={<button type="button">Settings</button>}
        mode="overlay"
        open={false}
        sections={[
          {
            items: [
              {
                icon: Settings,
                label: "Settings",
                onSelect: vi.fn()
              }
            ]
          }
        ]}
      />
    );

    expect(markup).toContain(styles.overlay);
    expect(markup).toContain(styles.overlayClosed);
    expect(markup).toContain(styles.footer);
    expect(markup).toContain("Settings");
    expect(markup).toContain('aria-hidden="true"');
  });
});
