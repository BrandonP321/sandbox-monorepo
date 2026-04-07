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
    fireEvent.click(screen.getByRole("button", { name }));
  }

  it("keeps typing at the live cursor, converts operators to symbols, and shows the result as the primary display", () => {
    render(<App />);

    const input = screen.getByRole("textbox", { name: "Expression input" }) as HTMLInputElement;

    expect(input).toHaveAttribute("placeholder", "0");
    expect(input.value).toBe("");
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

    fireEvent.change(input, {
      target: {
        value: "12×3+4",
        selectionStart: 6,
        selectionEnd: 6
      }
    });

    expect(input.value).toBe("12×3+4");

    clickButton("evaluate expression");

    expect(screen.getByTestId("calculation-preview")).toHaveTextContent("12×3+4");
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

    fireEvent.change(input, {
      target: {
        value: "9",
        selectionStart: 1,
        selectionEnd: 1
      }
    });

    expect(input.value).toBe("9");
    expect(screen.queryByTestId("result-value")).not.toBeInTheDocument();

    clickButton("evaluate expression");

    expect(screen.getByTestId("calculation-preview")).toHaveTextContent("9");
    expect(screen.getByTestId("result-value")).toHaveTextContent("9");

    clickButton("insert ×");
    expect(input.value).toBe("9×");
    clickButton("insert 3");

    expect(input.value).toBe("9×3");
    expect(screen.queryByTestId("result-value")).not.toBeInTheDocument();
  });

  it("opens history in an overlay and recalls a prior calculation as the active result", () => {
    render(<App />);

    const input = screen.getByRole("textbox", { name: "Expression input" }) as HTMLInputElement;

    clickButton("insert 7");
    clickButton("insert +");
    clickButton("insert 8");
    clickButton("evaluate expression");
    clickButton("clear expression");

    clickButton("open history");

    expect(screen.getByRole("dialog", { name: "Calculation history" })).toBeInTheDocument();

    clickButton("Use history result 15 from 7+8");

    expect(screen.queryByRole("dialog", { name: "Calculation history" })).not.toBeInTheDocument();
    expect(input.value).toBe("");
    expect(screen.getByTestId("calculation-preview")).toHaveTextContent("7+8");
    expect(screen.getByTestId("result-value")).toHaveTextContent("15");

    fireEvent.change(input, {
      target: {
        value: "+5",
        selectionStart: 2,
        selectionEnd: 2
      }
    });

    clickButton("evaluate expression");

    expect(screen.getByTestId("calculation-preview")).toHaveTextContent("15+5");
    expect(screen.getByTestId("result-value")).toHaveTextContent("20");
  });

  it("copies the latest result when there is no selection and sanitizes pasted input to display symbols", () => {
    render(<App />);

    const input = screen.getByRole("textbox", { name: "Expression input" }) as HTMLInputElement;

    clickButton("insert 2");
    clickButton("insert +");
    clickButton("insert 2");
    clickButton("evaluate expression");

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    fireEvent.keyDown(input, { key: "c", metaKey: true });

    expect(writeText).toHaveBeenCalledWith("4");

    clickButton("clear expression");
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "3 * 9 abc"
      }
    });

    expect(input.value).toBe("3 × 9 ");
  });
});
