import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "./App";
import { useGetHelloQuery } from "./services/helloApi";

vi.mock("./services/helloApi", async () => {
  const actual =
    await vi.importActual<typeof import("./services/helloApi")>(
      "./services/helloApi"
    );

  return {
    ...actual,
    useGetHelloQuery: vi.fn()
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

const useGetHelloQueryMock = vi.mocked(useGetHelloQuery);
type UseGetHelloQueryResult = ReturnType<typeof useGetHelloQuery>;

const mockHelloQueryResult = (
  result: Partial<UseGetHelloQueryResult>
): UseGetHelloQueryResult =>
  ({
    refetch: vi.fn(),
    ...result
  }) as UseGetHelloQueryResult;

describe("App", () => {
  it("renders backend message", async () => {
    useGetHelloQueryMock.mockReturnValue(
      mockHelloQueryResult({
      data: { message: "hello world (backend)" },
      isError: false,
      isLoading: false,
      isSuccess: true
      })
    );

    render(<App />);

    expect(screen.getByText("Hello World (frontend)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Backend says: Hello world (backend)")
    ).toBeInTheDocument();
  });

  it("renders an error message when the backend fails", async () => {
    useGetHelloQueryMock.mockReturnValue(
      mockHelloQueryResult({
      data: undefined,
      isError: true,
      isLoading: false,
      isSuccess: false
      })
    );

    render(<App />);

    expect(
      screen.getByText("Backend says: unable to reach the API.")
    ).toBeInTheDocument();
  });
});
