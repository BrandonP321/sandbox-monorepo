import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLanDevPlan,
  findLanIp,
  resolveLanIp,
  runLanDev
} from "./dev-lan.mjs";

test("findLanIp prefers the Wi-Fi interface when available", () => {
  assert.equal(
    findLanIp({
      en0: [
        {
          address: "10.0.0.42",
          family: "IPv4",
          internal: false
        }
      ],
      utun0: [
        {
          address: "100.64.0.2",
          family: "IPv4",
          internal: false
        }
      ]
    }),
    "10.0.0.42"
  );
});

test("resolveLanIp allows an explicit LAN_DEV_IP override", () => {
  assert.equal(
    resolveLanIp({
      env: { LAN_DEV_IP: " 192.168.1.50 " },
      interfaces: {}
    }),
    "192.168.1.50"
  );
});

test("buildLanDevPlan wires the local API URL into the web command", () => {
  const plan = buildLanDevPlan("signal-tracker", {
    env: { LAN_DEV_IP: "10.0.0.42" }
  });

  assert.equal(plan.apiBaseUrl, "http://10.0.0.42:3001");
  assert.equal(plan.webUrl, "http://10.0.0.42:5173");
  assert.deepEqual(plan.args, [
    "exec",
    "concurrently",
    "--kill-others-on-fail",
    "-n",
    "API,WEB",
    "-c",
    "magenta,cyan",
    "PORT=3001 pnpm --filter signal-tracker-api dev",
    "VITE_API_BASE_URL='http://10.0.0.42:3001' pnpm --filter signal-tracker-web exec vite --host 0.0.0.0 --port 5173 --strictPort"
  ]);
});

test("runLanDev passes full concurrently commands without shell splitting", () => {
  const calls = [];
  const qrCodes = [];
  const logs = [];
  const status = runLanDev("signal-tracker", {
    env: { LAN_DEV_IP: "10.0.0.42" },
    log: (message) => {
      logs.push(message);
    },
    renderQrCode: (url, options) => {
      qrCodes.push({ options, url });
    },
    runner: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: 0 };
    }
  });

  assert.equal(status, 0);
  assert.deepEqual(qrCodes, [
    { options: { small: true }, url: "http://10.0.0.42:5173" }
  ]);
  assert.deepEqual(logs, [
    "LAN IP: 10.0.0.42",
    "Web URL for phone: http://10.0.0.42:5173",
    "Web API target: http://10.0.0.42:3001",
    "Scan to open the web app:"
  ]);
  assert.deepEqual(calls, [
    {
      command: "pnpm",
      args: [
        "exec",
        "concurrently",
        "--kill-others-on-fail",
        "-n",
        "API,WEB",
        "-c",
        "magenta,cyan",
        "PORT=3001 pnpm --filter signal-tracker-api dev",
        "VITE_API_BASE_URL='http://10.0.0.42:3001' pnpm --filter signal-tracker-web exec vite --host 0.0.0.0 --port 5173 --strictPort"
      ],
      options: { shell: false, stdio: "inherit" }
    }
  ]);
});
