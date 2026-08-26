import {
  listAdminRsvpsResponseSchema,
  weddingWebsiteRoutes,
  type AdminRsvpSubmission
} from "@repo/wedding-website-shared";

type AdminRsvpApiResult =
  | { ok: true; submissions: AdminRsvpSubmission[] }
  | { ok: false; kind: "unauthorized" | "unavailable" };

type ListAdminRsvpsOptions = {
  accessKey: string;
  apiBaseUrl: string;
  fetcher?: typeof fetch;
};

function createAdminRsvpsUrl(apiBaseUrl: string): string {
  return `${apiBaseUrl.replace(/\/$/, "")}${weddingWebsiteRoutes.listAdminRsvps.path}`;
}

async function listAdminRsvps({
  accessKey,
  apiBaseUrl,
  fetcher = fetch
}: ListAdminRsvpsOptions): Promise<AdminRsvpApiResult> {
  let response: Response;
  try {
    response = await fetcher(createAdminRsvpsUrl(apiBaseUrl), {
      method: weddingWebsiteRoutes.listAdminRsvps.method,
      headers: { authorization: `Bearer ${accessKey}` },
      cache: "no-store"
    });
  } catch {
    return { ok: false, kind: "unavailable" };
  }

  if (response.status === 401) {
    return { ok: false, kind: "unauthorized" };
  }
  if (response.status !== 200) {
    return { ok: false, kind: "unavailable" };
  }

  try {
    const parsed = listAdminRsvpsResponseSchema.safeParse(
      await response.json()
    );
    return parsed.success
      ? { ok: true, submissions: parsed.data.submissions }
      : { ok: false, kind: "unavailable" };
  } catch {
    return { ok: false, kind: "unavailable" };
  }
}

export {
  createAdminRsvpsUrl,
  listAdminRsvps,
  type AdminRsvpApiResult,
  type ListAdminRsvpsOptions
};
