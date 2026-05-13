import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IconStack } from "./IconStack";

describe("IconStack", () => {
  it("renders visible icons", () => {
    render(
      <IconStack items={[{ icon: <span>R</span> }, { icon: <span>A</span> }]} />
    );

    expect(screen.getByText("R")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("collapses extra icons into an overflow count", () => {
    render(
      <IconStack
        items={[
          { icon: <span>1</span> },
          { icon: <span>2</span> },
          { icon: <span>3</span> },
          { icon: <span>4</span> }
        ]}
        maxVisible={2}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
    expect(screen.queryByText("4")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});
