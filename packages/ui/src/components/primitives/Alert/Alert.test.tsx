import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Bell } from "../../../icons";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders a semantic alert with the default shared treatment", () => {
    const markup = renderToStaticMarkup(
      <Alert title="Heads up">This setting affects every workspace user.</Alert>
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("_root_");
    expect(markup).toContain("_info_");
    expect(markup).toContain("_icon_");
    expect(markup).toContain("_title_");
    expect(markup).toContain("_message_");
    expect(markup).toContain("Heads up");
    expect(markup).toContain("This setting affects every workspace user.");
  });

  it("supports tone overrides and optional icon rendering", () => {
    const markup = renderToStaticMarkup(
      <Alert
        className="custom-alert"
        icon={false}
        role="status"
        tone="warning"
        title="Limited"
      >
        Export history is only available for the last 30 days.
      </Alert>
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("_warning_");
    expect(markup).toContain("custom-alert");
    expect(markup).not.toContain("_icon_");
    expect(markup).toContain("Limited");
  });

  it("accepts a custom icon when callers need one", () => {
    const markup = renderToStaticMarkup(
      <Alert icon={Bell} tone="success">
        Notification preferences saved.
      </Alert>
    );

    expect(markup).toContain("<svg");
    expect(markup).toContain("_success_");
    expect(markup).toContain("Notification preferences saved.");
  });
});
