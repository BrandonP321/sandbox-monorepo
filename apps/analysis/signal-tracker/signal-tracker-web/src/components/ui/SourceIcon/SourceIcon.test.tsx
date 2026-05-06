import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SourceIcon } from "./SourceIcon";

describe("SourceIcon", () => {
  it("renders a Google favicon for valid URLs", () => {
    const { container } = render(
      <SourceIcon url="https://agency.example/report" />
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://www.google.com/s2/favicons?domain=agency.example&sz=32"
    );
  });

  it("renders the default fallback when the URL has no hostname", () => {
    const { container } = render(<SourceIcon url={undefined} />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the default fallback after a favicon load failure", () => {
    const { container } = render(
      <SourceIcon url="https://agency.example/report" />
    );
    const favicon = container.querySelector("img");

    expect(favicon).toBeInTheDocument();

    fireEvent.error(favicon as HTMLImageElement);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a custom fallback icon", () => {
    render(<SourceIcon defaultIcon={<span>F</span>} url={undefined} />);

    expect(screen.getByText("F")).toBeInTheDocument();
  });
});
