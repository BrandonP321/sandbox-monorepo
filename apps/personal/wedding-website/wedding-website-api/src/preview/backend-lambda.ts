import { createPreviewAdminDependencies } from "./admin-dependencies.js";
import { createAdminRsvpAppRouter } from "../admin/router.js";
import { createPreviewBackend } from "./backend.js";
import { previewConfig } from "./config.js";

const config = previewConfig(process.env);
if (!process.env.RSVP_TABLE_NAME)
  throw new Error("An explicit existing table is required");
export const handler = createPreviewBackend(
  config,
  createAdminRsvpAppRouter(createPreviewAdminDependencies(process.env))
);
