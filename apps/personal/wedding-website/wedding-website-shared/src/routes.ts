import type {
  RouteContractRequest,
  RouteContractResponse
} from "@repo/api-contracts";

import {
  createRsvpSubmissionRequestSchema,
  createRsvpSubmissionResponseSchema
} from "./contracts.js";

export const weddingWebsiteRoutes = {
  createRsvpSubmission: {
    method: "POST",
    path: "/rsvp"
  }
} as const;

export type WeddingWebsiteRouteName = keyof typeof weddingWebsiteRoutes;

export const weddingWebsiteRouteContracts = {
  createRsvpSubmission: {
    route: weddingWebsiteRoutes.createRsvpSubmission,
    requestSchema: createRsvpSubmissionRequestSchema,
    responseSchema: createRsvpSubmissionResponseSchema
  }
} as const;

export type WeddingWebsiteRouteRequest<TName extends WeddingWebsiteRouteName> =
  RouteContractRequest<typeof weddingWebsiteRouteContracts, TName>;

export type WeddingWebsiteRouteResponse<TName extends WeddingWebsiteRouteName> =
  RouteContractResponse<typeof weddingWebsiteRouteContracts, TName>;
