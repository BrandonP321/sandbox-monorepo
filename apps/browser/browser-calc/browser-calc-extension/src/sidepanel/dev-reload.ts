const RELOAD_MARKER_PATH = "__dev_reload__.json";
const RELOAD_POLL_INTERVAL_MS = 1000;

export function parseReloadMarker(raw: string): number | null {
  try {
    const parsed = JSON.parse(raw) as { updatedAt?: unknown };

    return typeof parsed.updatedAt === "number" && Number.isFinite(parsed.updatedAt) ? parsed.updatedAt : null;
  } catch {
    return null;
  }
}

export function createReloadMarkerUrl(baseUrl: string, cacheBust: number): string {
  const url = new URL(baseUrl);
  url.searchParams.set("t", String(cacheBust));
  return url.toString();
}

if (import.meta.env.MODE === "development") {
  const markerUrl = chrome.runtime.getURL(RELOAD_MARKER_PATH);
  let lastSeenMarker: number | null = null;
  let isReloading = false;
  let hasLoggedReady = false;
  let hasLoggedError = false;

  const pollReloadMarker = async () => {
    try {
      const response = await fetch(createReloadMarkerUrl(markerUrl, Date.now()), {
        cache: "no-store"
      });

      if (!response.ok) {
        return;
      }

      const marker = parseReloadMarker(await response.text());

      if (marker === null) {
        return;
      }

      if (!hasLoggedReady) {
        hasLoggedReady = true;
        console.info("[dev] side panel reload polling enabled");
      }

      hasLoggedError = false;

      if (lastSeenMarker === null) {
        lastSeenMarker = marker;
        return;
      }

      if (marker !== lastSeenMarker && !isReloading) {
        isReloading = true;
        console.info("[dev] reloading side panel");
        window.location.reload();
      }
    } catch (error) {
      if (!hasLoggedError) {
        hasLoggedError = true;
        console.warn("[dev] side panel reload polling failed", error);
      }
    }
  };

  void pollReloadMarker();
  window.setInterval(() => {
    void pollReloadMarker();
  }, RELOAD_POLL_INTERVAL_MS);
}
