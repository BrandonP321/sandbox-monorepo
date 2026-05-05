import { describe, expect, it } from "vitest";

import {
  fallbackApiErrorMessage,
  getApiErrorMessage,
  isApiErrorCode
} from "./apiError";

describe("getApiErrorMessage", () => {
  it("reads standard API error payloads", () => {
    expect(
      getApiErrorMessage({
        error: {
          code: "VALIDATION_ERROR",
          message: "Enter a topic title."
        }
      })
    ).toBe("Enter a topic title.");
  });

  it("reads RTK fetchBaseQuery error data payloads", () => {
    expect(
      getApiErrorMessage({
        status: 400,
        data: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Topic title is already in use."
          }
        }
      })
    ).toBe("Topic title is already in use.");
  });

  it("reads RTK transport error messages", () => {
    expect(
      getApiErrorMessage({
        status: "FETCH_ERROR",
        error: "TypeError: Failed to fetch"
      })
    ).toBe("TypeError: Failed to fetch");
  });

  it("reads serialized error messages", () => {
    expect(getApiErrorMessage({ message: "Request failed" })).toBe(
      "Request failed"
    );
  });

  it("reads direct string errors", () => {
    expect(getApiErrorMessage("Request failed")).toBe("Request failed");
  });

  it("falls back for missing and blank messages", () => {
    expect(getApiErrorMessage(undefined)).toBe(fallbackApiErrorMessage);
    expect(getApiErrorMessage({ message: "   " })).toBe(
      fallbackApiErrorMessage
    );
  });
});

describe("isApiErrorCode", () => {
  it("matches standard API error payload codes", () => {
    expect(
      isApiErrorCode(
        {
          error: {
            code: "TOPIC_NOT_FOUND",
            message: "Topic not found"
          }
        },
        "TOPIC_NOT_FOUND"
      )
    ).toBe(true);
  });

  it("matches RTK fetchBaseQuery error data payload codes", () => {
    expect(
      isApiErrorCode(
        {
          status: 404,
          data: {
            error: {
              code: "TOPIC_NOT_FOUND",
              message: "Topic not found"
            }
          }
        },
        "TOPIC_NOT_FOUND"
      )
    ).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(
      isApiErrorCode(
        {
          status: 500,
          data: {
            error: {
              code: "DATABASE_UNAVAILABLE",
              message: "Database unavailable"
            }
          }
        },
        "TOPIC_NOT_FOUND"
      )
    ).toBe(false);
    expect(isApiErrorCode("Request failed", "TOPIC_NOT_FOUND")).toBe(false);
  });
});
