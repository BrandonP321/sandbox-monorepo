import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "../Button/Button";
import { ButtonGroup } from "./ButtonGroup";

describe("ButtonGroup", () => {
  it("renders a semantic group around button children", () => {
    const markup = renderToStaticMarkup(
      <ButtonGroup aria-label="Primary actions">
        <Button>Save</Button>
        <Button variant="primary">Publish</Button>
      </ButtonGroup>
    );

    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Primary actions"');
    expect(markup).toContain('data-orientation="horizontal"');
    expect(markup).toContain("_root_");
    expect(markup).toContain("_horizontal_");
    expect(markup).toContain("Save");
    expect(markup).toContain("Publish");
  });

  it("supports vertical layout and full-width children", () => {
    const markup = renderToStaticMarkup(
      <ButtonGroup fullWidth orientation="vertical">
        <Button>Approve</Button>
        <Button>Reject</Button>
      </ButtonGroup>
    );

    expect(markup).toContain('data-orientation="vertical"');
    expect(markup).toContain("_vertical_");
    expect(markup).toContain("_fullWidth_");
  });

  it("supports custom roles when callers need them", () => {
    const markup = renderToStaticMarkup(
      <ButtonGroup className="toolbar-actions" role="toolbar">
        <Button size="sm">Day</Button>
        <Button size="sm">Week</Button>
        <Button size="sm">Month</Button>
      </ButtonGroup>
    );

    expect(markup).toContain('role="toolbar"');
    expect(markup).toContain("toolbar-actions");
  });
});
