// Render-specific Vite config. Used for Node deployments on Render.
// Does NOT include the Cloudflare Workers plugin (which the default
// vite.config.ts pulls in via @lovable.dev/vite-tanstack-config).
//
// Build with:   bun run build:render
// Start with:   bun run start
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Use our Node entry instead of the default Cloudflare one.
      server: { entry: "server.node" },
    }),
    react(),
  ],
});
