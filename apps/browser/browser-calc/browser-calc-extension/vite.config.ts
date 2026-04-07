import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
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
});
