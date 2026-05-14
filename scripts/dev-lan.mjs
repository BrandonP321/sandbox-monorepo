#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const qrCode = require("qrcode-terminal");

export const lanDevProjects = {
  portfolio: {
    webFilter: "portfolio-web",
    webPort: 5174
  },
  "signal-tracker": {
    apiFilter: "signal-tracker-api",
    apiPort: 3001,
    webFilter: "signal-tracker-web",
    webPort: 5173
  }
};

const preferredInterfaceNames = ["en0", "en1"];

export function findLanIp(interfaces = networkInterfaces()) {
  const candidates = Object.entries(interfaces).flatMap(([name, addresses]) =>
    (addresses ?? [])
      .filter((address) => address.family === "IPv4" && !address.internal)
      .map((address) => ({ address: address.address, name }))
  );

  for (const interfaceName of preferredInterfaceNames) {
    const candidate = candidates.find(({ name }) => name === interfaceName);

    if (candidate) {
      return candidate.address;
    }
  }

  return candidates[0]?.address;
}

export function resolveLanIp({
  env = process.env,
  interfaces = networkInterfaces()
} = {}) {
  const explicitIp = env.LAN_DEV_IP?.trim() || env.LAN_IP?.trim();

  if (explicitIp) {
    return explicitIp;
  }

  const detectedIp = findLanIp(interfaces);

  if (!detectedIp) {
    throw new Error(
      "Unable to detect a LAN IPv4 address. Set LAN_DEV_IP to the IP address your phone can reach."
    );
  }

  return detectedIp;
}

export function buildLanDevPlan(projectName, options = {}) {
  const project = lanDevProjects[projectName];

  if (!project) {
    throw new Error(
      `Unsupported LAN dev project: ${projectName}. Supported projects: ${Object.keys(
        lanDevProjects
      ).join(", ")}`
    );
  }

  const lanIp = resolveLanIp(options);
  const apiBaseUrl = project.apiPort
    ? `http://${lanIp}:${project.apiPort}`
    : undefined;
  const webUrl = `http://${lanIp}:${project.webPort}`;
  const apiCommand =
    project.apiFilter && project.apiPort
      ? `PORT=${project.apiPort} pnpm --filter ${project.apiFilter} dev`
      : undefined;
  const webCommand = `${apiBaseUrl ? `VITE_API_BASE_URL=${shellQuote(apiBaseUrl)} ` : ""}pnpm --filter ${project.webFilter} exec vite --host 0.0.0.0 --port ${
    project.webPort
  } --strictPort`;
  const serverNames = apiCommand ? "API,WEB" : "WEB";
  const serverColors = apiCommand ? "magenta,cyan" : "cyan";
  const serverCommands = apiCommand ? [apiCommand, webCommand] : [webCommand];

  return {
    apiBaseUrl,
    command: "pnpm",
    args: [
      "exec",
      "concurrently",
      "--kill-others-on-fail",
      "-n",
      serverNames,
      "-c",
      serverColors,
      ...serverCommands
    ],
    lanIp,
    webUrl
  };
}

export function runLanDev(projectName, options = {}) {
  const plan = buildLanDevPlan(projectName, options);
  const renderQrCode =
    options.renderQrCode ??
    ((url, qrOptions) => qrCode.generate(url, qrOptions));

  options.log?.(`LAN IP: ${plan.lanIp}`);
  options.log?.(`Web URL for phone: ${plan.webUrl}`);
  if (plan.apiBaseUrl) {
    options.log?.(`Web API target: ${plan.apiBaseUrl}`);
  }
  options.log?.("Scan to open the web app:");
  renderQrCode(plan.webUrl, { small: true });

  const result = (options.runner ?? spawnSync)(plan.command, plan.args, {
    stdio: "inherit",
    shell: false
  });

  return result.status ?? 1;
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function main() {
  const projectName = process.argv[2];

  if (!projectName) {
    console.error("Usage: node scripts/dev-lan.mjs <project>");
    console.error(
      `Supported projects: ${Object.keys(lanDevProjects).join(", ")}`
    );
    process.exit(1);
  }

  process.exit(runLanDev(projectName, { log: console.log }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
