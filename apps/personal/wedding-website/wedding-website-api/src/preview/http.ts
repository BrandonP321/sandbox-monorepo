import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
} from "aws-lambda";

export type PreviewEvent = Pick<
  APIGatewayProxyEventV2,
  "rawPath" | "rawQueryString" | "headers" | "cookies" | "requestContext"
>;
export type PreviewResponse = APIGatewayProxyStructuredResultV2 & {
  statusCode: number;
};
export const responseHeaders = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  "strict-transport-security": "max-age=31536000"
};
export function reply(statusCode: number, body: string): PreviewResponse {
  return {
    statusCode,
    headers: {
      ...responseHeaders,
      "content-type": "text/plain; charset=utf-8"
    },
    body
  };
}
export function header(event: PreviewEvent, name: string): string {
  return (
    Object.entries(event.headers).find(
      ([key]) => key.toLowerCase() === name
    )?.[1] ?? ""
  );
}
