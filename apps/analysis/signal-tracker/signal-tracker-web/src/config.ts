export type RuntimeConfig = {
  apiBaseUrl: string;
};

const DEFAULT_API_URL = "http://localhost:3001";

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const response = await fetch("/config.json", { cache: "no-store" });

    if (response.ok) {
      const data = (await response.json()) as RuntimeConfig;
      if (data.apiBaseUrl) {
        return data;
      }
    }
  } catch {
    // Ignore and fall back to defaults.
  }

  const envApiUrl = import.meta.env.VITE_API_URL;

  return {
    apiBaseUrl: envApiUrl || DEFAULT_API_URL
  };
}
