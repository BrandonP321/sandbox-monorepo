import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  apiErrorSchema,
  buildRouteContractRequest,
  fallbackApiErrorMessage,
  getApiErrorMessage,
  isApiErrorCode,
  parseRouteContractResponse,
  type RouteContractRegistry,
  type RouteContractRequest,
  type RouteContractResponse
} from "./index";

describe("API error helpers", () => {
  it("accepts the standard error payload shape", () => {
    const payload = apiErrorSchema.parse({
      error: { code: "NOT_FOUND", message: "Not Found" }
    });

    expect(payload.error.code).toBe("NOT_FOUND");
  });

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

  it("reads serialized and direct string error messages", () => {
    expect(getApiErrorMessage({ message: "Request failed" })).toBe(
      "Request failed"
    );
    expect(getApiErrorMessage("Request failed")).toBe("Request failed");
  });

  it("falls back for missing and blank messages", () => {
    expect(getApiErrorMessage(undefined)).toBe(fallbackApiErrorMessage);
    expect(getApiErrorMessage({ message: "   " })).toBe(
      fallbackApiErrorMessage
    );
  });

  it("matches direct and nested API error codes", () => {
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
    expect(isApiErrorCode("Request failed", "TOPIC_NOT_FOUND")).toBe(false);
  });
});

describe("route contract helpers", () => {
  const routeContracts = {
    getThing: {
      route: {
        method: "POST",
        path: "/get-thing"
      },
      requestSchema: z.object({
        thingId: z.string().min(1)
      }),
      responseSchema: z.object({
        name: z.string()
      })
    }
  } as const satisfies RouteContractRegistry;

  it("builds a transport request without importing a client implementation", () => {
    const request = {
      thingId: "thing-1"
    } satisfies RouteContractRequest<typeof routeContracts, "getThing">;

    expect(
      buildRouteContractRequest(routeContracts, "getThing", request)
    ).toEqual({
      body: {
        thingId: "thing-1"
      },
      method: "POST",
      url: "/get-thing"
    });
  });

  it("parses route responses through the route response schema", () => {
    const response = parseRouteContractResponse(routeContracts, "getThing", {
      name: "Thing 1"
    }) satisfies RouteContractResponse<typeof routeContracts, "getThing">;

    expect(response).toEqual({
      name: "Thing 1"
    });
  });
});
