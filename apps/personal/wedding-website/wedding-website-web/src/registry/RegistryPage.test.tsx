import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RegistryPage } from "./RegistryPage";
import type { RegistryGiftConfig } from "./registryGiftConfig";

const amazonRegistryUrl =
  "https://www.amazon.com/wedding/guest-view/27PRMQK3UYB4K";

function createTestConfig(
  overrides: Pick<RegistryGiftConfig, "venmo" | "zelle">
): RegistryGiftConfig {
  return {
    amazon: { enabled: true, registryUrl: amazonRegistryUrl },
    ...overrides
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("RegistryPage", () => {
  it("renders the approved Amazon destination and omits unverified methods", () => {
    render(<RegistryPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Registry & Gifts" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gifts are completely optional/i)
    ).toBeInTheDocument();

    const amazonLink = screen.getByRole("link", {
      name: "View our Amazon registry"
    });
    expect(amazonLink).toHaveAttribute("href", amazonRegistryUrl);
    expect(amazonLink).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(amazonLink).toHaveAttribute("rel", "noreferrer");
    expect(amazonLink).not.toHaveAttribute("target");
    expect(screen.getByText("Opens Amazon.")).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Honeymoon Fund" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Venmo" })).toBeNull();
    expect(screen.queryByText("Prefer Zelle?")).toBeNull();
    expect(screen.queryByRole("img", { name: /QR code/i })).toBeNull();

    const decorativeLayers = document.querySelectorAll(
      ".registry-page .ui-decorative-layer"
    );
    expect(decorativeLayers.length).toBeGreaterThan(0);
    for (const layer of decorativeLayers) {
      expect(layer).toHaveAttribute("aria-hidden", "true");
      expect(layer.querySelector("button, a, input")).toBeNull();
    }
  });

  it("copies the exact Venmo username and preserves normal external-link behavior", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: { writeText }
    });
    const config = createTestConfig({
      venmo: {
        enabled: true,
        profileUrl: "https://venmo.com/u/example-wedding-account",
        recipientName: "Example Recipient",
        username: "@example-wedding-account"
      },
      zelle: { enabled: false }
    });

    render(<RegistryPage config={config} />);

    const venmoLink = screen.getByRole("link", { name: "Open Venmo" });
    expect(venmoLink).toHaveAttribute(
      "href",
      "https://venmo.com/u/example-wedding-account"
    );
    expect(venmoLink).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(venmoLink).not.toHaveAttribute("target");

    const copyButton = screen.getByRole("button", {
      name: "Copy Venmo username"
    });
    copyButton.focus();
    fireEvent.click(copyButton);

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("@example-wedding-account")
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Venmo username copied."
    );
    expect(copyButton).toHaveFocus();
  });

  it("keeps manual Zelle copying available when clipboard access fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    vi.stubGlobal("navigator", {
      clipboard: { writeText }
    });
    const config = createTestConfig({
      venmo: { enabled: false },
      zelle: {
        email: "wedding-gifts@example.test",
        enabled: true,
        recipientName: "Example Recipient"
      }
    });

    render(<RegistryPage config={config} />);

    const zelleDetails = screen.getByText("Prefer Zelle?").closest("details")!;
    expect(zelleDetails).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Prefer Zelle?"));
    expect(zelleDetails).toHaveAttribute("open");

    const identifier = screen.getByText("wedding-gifts@example.test");
    expect(identifier).toHaveClass("registry-page__identifier");
    const copyButton = screen.getByRole("button", {
      name: "Copy Zelle email"
    });
    copyButton.focus();
    fireEvent.click(copyButton);

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Couldn’t copy. Please select and copy the email above."
      )
    );
    expect(writeText).toHaveBeenCalledWith("wedding-gifts@example.test");
    expect(copyButton).toHaveFocus();
  });

  it("keeps a text fallback when an optional Venmo QR image fails", () => {
    const config = createTestConfig({
      venmo: {
        enabled: true,
        profileUrl: "https://venmo.com/u/example-wedding-account",
        qrCode: {
          alt: "Venmo receive QR code for Example Recipient",
          height: 256,
          src: "/synthetic-venmo-qr.png",
          width: 256
        },
        recipientName: "Example Recipient",
        username: "@example-wedding-account"
      },
      zelle: { enabled: false }
    });

    render(<RegistryPage config={config} />);

    const qrDetails = screen
      .getByText("Show Venmo QR code")
      .closest("details")!;
    expect(qrDetails).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Show Venmo QR code"));
    expect(qrDetails).toHaveAttribute("open");

    fireEvent.error(
      screen.getByRole("img", {
        name: "Venmo receive QR code for Example Recipient"
      })
    );

    expect(
      screen.getByText(
        "The Venmo QR code is unavailable. Use the link or username above."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Scan with Venmo on another device, or use the link above."
      )
    ).toBeNull();
    expect(
      screen.getByRole("link", { name: "Open Venmo" })
    ).toBeInTheDocument();
    expect(screen.getByText("@example-wedding-account")).toBeInTheDocument();
  });
});
