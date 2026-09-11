import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegistryPage } from "./RegistryPage";

const amazonRegistryUrl =
  "https://www.amazon.com/wedding/guest-view/27PRMQK3UYB4K";
const honeyfundUrl =
  "https://www.honeyfund.com/site/martin-phillips-08-21-2027";

describe("RegistryPage", () => {
  it("renders the approved Amazon and Honeyfund destinations", () => {
    render(<RegistryPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Registry & Gifts" })
    ).toHaveClass("guest-page-heading");
    for (const sectionHeading of screen.getAllByRole("heading", { level: 2 })) {
      expect(sectionHeading).toHaveClass("guest-section-heading");
    }
    expect(
      screen.getByText(
        "Celebrating with you is what matters most to us. Gifts are completely optional. If you’d like to give something, we’ve shared a few ideas below."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Niamh & Brandon")).toBeNull();
    expect(
      screen.queryByText(
        "Thank you for helping us celebrate this next chapter together."
      )
    ).toBeNull();

    const amazonLink = screen.getByRole("link", {
      name: "View our Amazon registry"
    });
    expect(amazonLink).toHaveAttribute("href", amazonRegistryUrl);
    expect(amazonLink).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(amazonLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(amazonLink).toHaveAttribute("target", "_blank");
    expect(screen.queryByText("Opens Amazon.")).toBeNull();

    expect(
      screen.getByText(/we’ve created a Honeyfund for our honeymoon/i)
    ).toBeInTheDocument();
    const honeyfundLink = screen.getByRole("link", {
      name: "View our Honeyfund"
    });
    expect(honeyfundLink).toHaveAttribute("href", honeyfundUrl);
    expect(honeyfundLink).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(honeyfundLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(honeyfundLink).toHaveAttribute("target", "_blank");

    const decorativeLayers = document.querySelectorAll(
      ".registry-page .ui-decorative-layer"
    );
    expect(
      document.querySelector(".registry-page .wedding-corner-floral")
    ).not.toBeNull();
    expect(decorativeLayers.length).toBeGreaterThan(0);
    for (const layer of decorativeLayers) {
      expect(layer).toHaveAttribute("aria-hidden", "true");
      expect(layer.querySelector("button, a, input")).toBeNull();
    }
  });

  it("places the floral divider between the registry and honeymoon sections", () => {
    render(<RegistryPage />);

    const registrySection = screen
      .getByRole("heading", { name: "Amazon Wedding Registry" })
      .closest("section");
    const honeymoonSection = screen
      .getByRole("heading", { name: "Honeymoon Fund" })
      .closest("section");
    const divider = document.querySelector(".registry-page__divider");

    expect(registrySection?.nextElementSibling).toBe(divider);
    expect(divider?.nextElementSibling).toBe(honeymoonSection);
    expect(divider?.querySelector("img")).not.toBeNull();
  });
});
