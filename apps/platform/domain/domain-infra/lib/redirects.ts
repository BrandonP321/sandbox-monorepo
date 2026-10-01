/** Reviewed destinations only. Requests never contribute to Location. */
export const redirects: Readonly<Record<string, string>> = {
  "actions.bphillips.dev":
    "https://brandon-action-console.brandonp321.chatgpt.site/"
};

export function redirectFunctionCode(
  map: Readonly<Record<string, string>>
): string {
  if (Object.keys(map).length === 0)
    throw new Error("Redirect map must not be empty");
  for (const [host, destination] of Object.entries(map)) {
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.bphillips\.dev$/.test(host)) {
      throw new Error(`Invalid redirect host: ${host}`);
    }
    const url = new URL(destination);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash ||
      url.pathname !== "/" ||
      !/^[a-z0-9-]+\.brandonp321\.chatgpt\.site$/.test(url.hostname) ||
      destination !== url.href
    ) {
      throw new Error(`Unsafe redirect destination: ${destination}`);
    }
  }
  return `function handler(event) {
    var request = event.request;
    var host = request.headers.host;
    var destinations = ${JSON.stringify(map)};
    var headers = {
      "cache-control": { value: "no-store, max-age=0" },
      "referrer-policy": { value: "no-referrer" }
    };
    if (!host || !Object.prototype.hasOwnProperty.call(destinations, host.value) || request.uri !== "/") {
      return { statusCode: 404, statusDescription: "Not Found", headers: headers };
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      headers.allow = { value: "GET, HEAD" };
      return { statusCode: 405, statusDescription: "Method Not Allowed", headers: headers };
    }
    headers.location = { value: destinations[host.value] };
    return { statusCode: 302, statusDescription: "Found", headers: headers };
  }`;
}
