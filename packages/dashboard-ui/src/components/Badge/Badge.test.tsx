import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders badge content", () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
