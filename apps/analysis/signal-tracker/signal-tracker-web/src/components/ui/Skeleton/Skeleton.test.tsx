import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders the default loading placeholder classes", () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.firstElementChild;

    expect(skeleton).toHaveClass("bg-muted");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
  });

  it("merges caller classes without dropping the loading treatment", () => {
    const { container } = render(<Skeleton className="h-4 w-24 rounded-lg" />);

    const skeleton = container.firstElementChild;

    expect(skeleton).toHaveClass("bg-muted");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("h-4");
    expect(skeleton).toHaveClass("w-24");
    expect(skeleton).toHaveClass("rounded-lg");
    expect(skeleton).not.toHaveClass("rounded-md");
  });
});
