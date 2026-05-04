import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders alert title, content, and actions", () => {
    render(
      <Alert
        actions={<button type="button">Retry</button>}
        title="Topics could not be loaded."
      >
        Retry the request.
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Topics could not be loaded.")).toBeInTheDocument();
    expect(screen.getByText("Retry the request.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
