import type {
  RouteContractRequest,
  RouteContractResponse
} from "@repo/api-contracts";
import { z } from "zod";

import {
  createRsvpSubmissionRequestSchema,
  createRsvpSubmissionResponseSchema,
  listAdminRsvpsResponseSchema
} from "./contracts.js";

export const weddingWebsiteRoutes = {
  createRsvpSubmission: {
    method: "POST",
    path: "/rsvp"
  },
  listAdminRsvps: {
    method: "GET",
    path: "/admin/rsvps"
  }
} as const;

export type WeddingWebsiteRouteName = keyof typeof weddingWebsiteRoutes;

export const weddingWebsiteRouteContracts = {
  createRsvpSubmission: {
    route: weddingWebsiteRoutes.createRsvpSubmission,
    requestSchema: createRsvpSubmissionRequestSchema,
    responseSchema: createRsvpSubmissionResponseSchema
  },
  listAdminRsvps: {
    route: weddingWebsiteRoutes.listAdminRsvps,
    requestSchema: z.undefined(),
    responseSchema: listAdminRsvpsResponseSchema
  }
} as const;

export type WeddingWebsiteRouteRequest<TName extends WeddingWebsiteRouteName> =
  RouteContractRequest<typeof weddingWebsiteRouteContracts, TName>;

export type WeddingWebsiteRouteResponse<TName extends WeddingWebsiteRouteName> =
  RouteContractResponse<typeof weddingWebsiteRouteContracts, TName>;
