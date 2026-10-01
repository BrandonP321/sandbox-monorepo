#!/usr/bin/env node
// Read-only smoke checks after the distribution is Deployed and DNS is INSYNC.
import process from "node:process";
import console from "node:console";
import assert from "node:assert/strict";
import { resolve4, resolve6 } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
const host = "actions.bphillips.dev";
const destination = "https://brandon-action-console.brandonp321.chatgpt.site/";
const cdn = process.argv[2];
assert.match(
  cdn ?? "",
  /^d[a-z0-9]+\.cloudfront\.net$/,
  "Pass the DistributionDomainName output"
);
function check(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const req = client.request(url, { method, timeout: 15000 }, (res) => {
      res.resume();
      res.on("end", () =>
        resolve({ status: res.statusCode, headers: res.headers })
      );
    });
    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.on("error", reject);
    req.end();
  });
}
const dns = { A: await resolve4(host), AAAA: await resolve6(host) };
assert.ok(dns.A.length && dns.AAAA.length);
for (const protocol of ["http", "https"]) {
  for (const method of ["GET", "HEAD"]) {
    const result = await check(
      `${protocol}://${host}/?next=https://evil.example&token=synthetic-probe`,
      method
    );
    assert.equal(result.status, 302);
    assert.equal(result.headers.location, destination);
    assert.match(result.headers["cache-control"], /no-store/);
    assert.equal(result.headers["referrer-policy"], "no-referrer");
  }
}
for (const url of [
  `https://${host}/unknown`,
  `https://${host}//evil.example`,
  `https://${cdn}/`
]) {
  const result = await check(url);
  assert.equal(result.status, 404);
  assert.equal(result.headers.location, undefined);
}
const post = await check(`https://${host}/`, "POST");
assert.ok([403, 405].includes(post.status));
assert.equal(post.headers.location, undefined);
console.log(
  JSON.stringify(
    {
      host,
      cdn,
      dns,
      result:
        "DNS, trusted HTTPS, temporary redirects and rejection checks passed"
    },
    null,
    2
  )
);
