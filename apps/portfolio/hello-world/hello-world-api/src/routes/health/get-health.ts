import { responses } from "@repo/api-core";

export function getHealth() {
  return responses.ok({ ok: true });
}
