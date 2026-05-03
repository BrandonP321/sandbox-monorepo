import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./DropdownMenu";

describe("DropdownMenu", () => {
  it("opens from the trigger and renders menu items", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button>Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Open</DropdownMenuItem>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("button", { name: "Open menu" }), {
      code: "Enter",
      key: "Enter"
    });

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Open" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Rename" })
    ).toBeInTheDocument();
  });

  it("runs item selection handlers", () => {
    const handleSelect = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <Button>Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleSelect}>Open</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Open" }));

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it("does not run disabled item selection handlers", () => {
    const handleSelect = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <Button>Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={handleSelect}>
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Duplicate" }));

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("renders labels, separators, and custom item classes", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <Button>Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Manage</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-base">Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText("Manage")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveClass(
      "text-base"
    );
  });
});
