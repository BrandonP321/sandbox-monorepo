import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { z } from "zod";

export const defaultSessionDirectory = join(
  homedir(),
  ".local",
  "state",
  "timelines-mcp-proof"
);
export const sessionDirectory = () =>
  process.env.TIMELINES_PROOF_SESSION ?? defaultSessionDirectory;
const connectionSchema = z.strictObject({
  url: z
    .string()
    .url()
    .refine((value) => {
      const url = new URL(value);
      return (
        url.protocol === "http:" &&
        url.hostname === "127.0.0.1" &&
        url.pathname === "/" &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash
      );
    }),
  token: z.string().regex(/^[a-f0-9]{64}$/)
});
export async function readConnection(role: "reader" | "editor" | "owner") {
  return connectionSchema.parse(
    JSON.parse(await readFile(join(sessionDirectory(), `${role}.json`), "utf8"))
  );
}
