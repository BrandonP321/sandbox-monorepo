import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Sidepanel App", () => {
  it("renders default display and keypad", () => {
    render(<App />);

    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByRole("button", { name: "digit 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "equals" })).toBeInTheDocument();
  });

  it("updates display from click flow", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "digit 7" }));
    fireEvent.click(screen.getByRole("button", { name: "add operator" }));
    fireEvent.click(screen.getByRole("button", { name: "digit 8" }));
    fireEvent.click(screen.getByRole("button", { name: "equals" }));

    expect(screen.getByTestId("display")).toHaveTextContent("15");
  });

  it("maps keyboard Enter, Backspace, operators, and digits", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "9" });
    fireEvent.keyDown(window, { key: "/" });
    fireEvent.keyDown(window, { key: "3" });
    fireEvent.keyDown(window, { key: "Enter" });

    expect(screen.getByTestId("display")).toHaveTextContent("3");

    fireEvent.keyDown(window, { key: "Backspace" });
    expect(screen.getByTestId("display")).toHaveTextContent("3");

    fireEvent.keyDown(window, { key: "2" });
    fireEvent.keyDown(window, { key: "Backspace" });

    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });
});
