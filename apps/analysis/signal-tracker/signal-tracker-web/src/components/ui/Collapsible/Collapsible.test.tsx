import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../Button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "./Collapsible";

describe("Collapsible", () => {
  it("opens from the trigger and renders content", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>
          <Button>Show details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p>Collapsible content</p>
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show details" }));

    expect(screen.getByText("Collapsible content")).toBeInTheDocument();
  });

  it("closes from the trigger when open", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          <Button>Toggle details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p>Collapsible content</p>
        </CollapsibleContent>
      </Collapsible>
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle details" }));

    expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();
  });

  it("passes open changes through the root component", () => {
    const handleOpenChange = vi.fn();

    render(
      <Collapsible onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>
          <Button>Show details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p>Collapsible content</p>
        </CollapsibleContent>
      </Collapsible>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show details" }));

    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });
});
