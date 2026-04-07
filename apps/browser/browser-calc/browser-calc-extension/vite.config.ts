import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

function devReloadMarkerPlugin(enabled: boolean): Plugin {
  return {
    name: "dev-reload-marker-plugin",
    apply: "build" as const,
    generateBundle() {
      if (!enabled) {
        return;
      }

      this.emitFile({
        type: "asset",
        fileName: "__dev_reload__.json",
        source: JSON.stringify({ updatedAt: Date.now() })
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), devReloadMarkerPlugin(mode === "development")],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "sidepanel.html"),
        background: resolve(__dirname, "src/background.ts")
      },
      output: {
        entryFileNames: (chunkInfo) => (chunkInfo.name === "background" ? "background.js" : "assets/[name]-[hash].js")
      }
    }
  }
}));
