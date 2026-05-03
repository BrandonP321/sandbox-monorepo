import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger
} from "./Popover";

describe("Popover", () => {
  it("opens from the trigger and renders content", () => {
    render(
      <Popover>
        <PopoverTrigger>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );

    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open popover" }));

    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });

  it("closes from a close action", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover content</p>
          <PopoverClose>
            <Button>Close</Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("merges custom content classes", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" data-testid="popover-content">
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByTestId("popover-content")).toHaveClass("w-96");
  });
});
