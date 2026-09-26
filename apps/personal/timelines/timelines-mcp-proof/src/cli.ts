import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { idSchema } from "./contracts.js";
import { readConnection, sessionDirectory } from "./connection.js";
import { startFixture } from "./http.js";

const [command, proposalId, digest] = process.argv.slice(2);
if (command === "serve") {
  const directory = sessionDirectory();
  // A second start must use a fresh directory: do not replace a live session's credentials.
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(join(directory, "session.lock"), `${process.pid}\n`, {
    flag: "wx",
    mode: 0o600
  });
  const fixture = await startFixture();
  for (const role of ["reader", "editor", "owner"] as const) {
    await writeFile(
      join(directory, `${role}.json`),
      JSON.stringify({ url: fixture.url, token: fixture.credentials[role] }),
      { flag: "wx", mode: 0o600 }
    );
  }
  console.log(
    `Disposable fixture listening at ${fixture.url}/mcp\nSession directory: ${directory}\nCredentials are private files, never paste them into chat. Stop with Ctrl+C; all fixture data then expires. Use a fresh session directory on restart.`
  );
  const stop = () => {
    void fixture.close().then(() => process.exit(0));
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
} else if (command === "preview" || command === "approve") {
  const id = idSchema.parse(proposalId);
  const connection = await readConnection("owner");
  const headers = {
    Authorization: `Bearer ${connection.token}`,
    "Content-Type": "application/json"
  };
  const preview = await fetch(`${connection.url}/owner/proposals/${id}`, {
    headers
  });
  if (!preview.ok)
    throw new Error(
      `Preview rejected (${preview.status}): ${await preview.text()}`
    );
  const snapshot: unknown = await preview.json();
  console.log(JSON.stringify(snapshot, null, 2));
  if (command === "approve") {
    if (!digest || !/^[a-f0-9]{64}$/.test(digest))
      throw new Error("Supply the digest of the exact preview you reviewed.");
    const approval = await fetch(`${connection.url}/owner/approve`, {
      method: "POST",
      headers,
      body: JSON.stringify({ proposalId: id, digest })
    });
    if (!approval.ok)
      throw new Error(
        `Approval rejected (${approval.status}): ${await approval.text()}`
      );
    console.log(await approval.text());
  }
} else {
  throw new Error(
    "Usage: owner serve | preview PROPOSAL_ID | approve PROPOSAL_ID EXACT_REVIEWED_DIGEST"
  );
}
