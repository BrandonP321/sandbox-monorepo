import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const appDependency = (dependency: string) =>
  path.resolve(__dirname, "node_modules", dependency);

export default defineConfig({
  build: {
    rollupOptions: {
      maxParallelFileOps: 32
    }
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hookform/resolvers": appDependency("@hookform/resolvers"),
      react: appDependency("react"),
      "react-dom": appDependency("react-dom"),
      "react-hook-form": appDependency("react-hook-form"),
      zod: appDependency("zod")
    }
  }
});
