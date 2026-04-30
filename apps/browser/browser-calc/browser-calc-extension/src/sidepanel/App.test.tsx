import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("Sidepanel App", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText
      }
    });
  });

  function clickButton(name: string) {
    const element =
      screen.queryByRole("button", { name }) ??
      screen.queryByRole("switch", { name });

    if (!element) {
      throw new Error(`Unable to find clickable control named "${name}"`);
    }

    fireEvent.click(element);
  }

  it("keeps typing at the live cursor, converts operators to symbols, and shows the result as the primary display", () => {
    render(<App />);

    const input = screen.getByRole("textbox", {
      name: "Expression input"
    }) as HTMLInputElement;

    expect(input.value).toBe("");
    expect(screen.getByTestId("expression-overlay")).toHaveTextContent("0");
    expect(screen.queryByTestId("calculation-preview")).not.toBeInTheDocument();
    expect(screen.queryByTestId("result-value")).not.toBeInTheDocument();

    fireEvent.change(input, {
      target: {
        value: "12*3",
        selectionStart: 4,
        selectionEnd: 4
      }
    });

    expect(input.value).toBe("12×3");
    expect(input.selectionStart).toBe(4);
    expect(screen.getByTestId("expression-overlay")).toHaveTextContent("12×3");

    fireEvent.change(input, {
      target: {
        value: "12×3+4",
        selectionStart: 6,
        selectionEnd: 6
      }
    });

    expect(input.value).toBe("12×3+4");

    clickButton("evaluate expression");

    expect(screen.getByTestId("calculation-preview")).toHaveTextContent(
      "12×3+4"
    );
    expect(screen.getByTestId("result-value")).toHaveTextContent("40");
    expect(input.value).toBe("");

    fireEvent.change(input, {
      target: {
        value: "×3",
        selectionStart: 2,
        selectionEnd: 2
      }
    });

    expect(input.value).toBe("40×3");
    expect(screen.queryByTestId("result-value")).not.toBeInTheDocument();
  });

  it("reveals scientific buttons without changing modes and still accepts hidden keyboard syntax", () => {
    render(<App />);

    const input = screen.getByRole("textbox", {
      name: "Expression input"
    }) as HTMLInputElement;

    expect(
      screen.queryByRole("button", { name: "insert square root" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("DEG")).toBeInTheDocument();

    fireEvent.change(input, {
      target: {
        value: "sqrt(9)+asin(.5)+2^3",
        selectionStart: 19,
        selectionEnd: 19
      }
    });

    expect(input.value).toBe("√(9)+sin⁻¹(.5)+2^3");
    expect(screen.getByTestId("expression-overlay")).toHaveTextContent(
      "√(9)+sin⁻¹(.5)+2"
    );

    clickButton("evaluate expression");
    expect(screen.getByTestId("result-value")).toHaveTextContent("41");

    clickButton("show scientific buttons");

    expect(
      screen.getByRole("button", { name: "insert square root" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "set angle mode to radians" })
    ).toBeInTheDocument();
  });

  it("lets operators continue after an exponent when entered with scientific buttons", () => {
    render(<App />);

    clickButton("show scientific buttons");
    clickButton("insert 2");
    clickButton("insert exponent operator");
    clickButton("insert 3");
    clickButton("insert +");
    clickButton("insert 5");

    const input = screen.getByRole("textbox", {
      name: "Expression input"
    }) as HTMLInputElement;

    expect(input.value).toBe("2^3+5");
    expect(screen.getByTestId("expression-overlay")).toHaveTextContent("2");

    clickButton("evaluate expression");
    expect(screen.getByTestId("result-value")).toHaveTextContent("13");
  });

  it("opens history, copies the latest result, and supports memory buttons from the scientific panel", () => {
    render(<App />);

    const input = screen.getByRole("textbox", {
      name: "Expression input"
    }) as HTMLInputElement;

    clickButton("insert 7");
    clickButton("insert +");
    clickButton("insert 8");
    clickButton("evaluate expression");
    clickButton("show scientific buttons");
    clickButton("add displayed value to memory");
    expect(screen.getByText("M 15")).toBeInTheDocument();

    clickButton("clear expression");
    clickButton("recall memory");
    expect(input.value).toBe("15");

    clickButton("open history");
    expect(
      screen.getByRole("dialog", { name: "Calculation history" })
    ).toBeInTheDocument();
    clickButton("Use history result 15 from 7+8");

    fireEvent.change(input, {
      target: {
        value: "+5",
        selectionStart: 2,
        selectionEnd: 2
      }
    });

    clickButton("evaluate expression");
    expect(screen.getByTestId("result-value")).toHaveTextContent("20");

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    fireEvent.keyDown(input, { key: "c", metaKey: true });

    expect(writeText).toHaveBeenCalledWith("20");
  });
});
