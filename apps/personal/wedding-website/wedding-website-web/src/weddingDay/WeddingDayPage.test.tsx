import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { weddingImageAssets } from "../weddingImageAssets";
import { WeddingDayPage } from "./WeddingDayPage";

describe("WeddingDayPage", () => {
  it("renders the approved coming-soon message with shared heading styles", () => {
    render(<WeddingDayPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Wedding Day" })
    ).toHaveClass("guest-page-heading");
    expect(
      screen.getByRole("heading", { level: 2, name: "Details coming soon" })
    ).toHaveClass("guest-section-heading");

    const date = screen.getByText("August 21, 2027", { selector: "time" });
    expect(date).toHaveAttribute("datetime", "2027-08-21");
    expect(
      screen.getByText("We can’t wait to celebrate with you!")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We’ll share the schedule and details here as our plans come together."
      )
    ).toBeInTheDocument();

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText(/location|parking|address/i)).toBeNull();
  });

  it("keeps every illustration decorative and non-interactive", () => {
    render(<WeddingDayPage />);

    const decorativeLayers = document.querySelectorAll(
      ".wedding-day-page .ui-decorative-layer"
    );
    expect(decorativeLayers).toHaveLength(3);
    expect(
      document.querySelector(".wedding-day-page .wedding-corner-floral")
    ).not.toBeNull();
    expect(document.querySelectorAll(".wedding-day-page img")).toHaveLength(4);
    expect(
      document.querySelector<HTMLImageElement>(
        ".wedding-day-page__closing-heart"
      )
    ).toHaveAttribute("src", weddingImageAssets.registryHeart.previewSrc);

    for (const layer of decorativeLayers) {
      expect(layer).toHaveAttribute("aria-hidden", "true");
      expect(layer.querySelector("button, a, input")).toBeNull();
      for (const image of layer.querySelectorAll("img")) {
        expect(image).toHaveAttribute("alt", "");
        expect(image).toHaveAttribute("draggable", "false");
      }
    }
  });
});
