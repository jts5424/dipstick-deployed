import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3000, // Always use port 3000
    proxy: {
      '/api/prototype': {
        target: 'http://localhost:5001', // Always proxy to backend on port 5001
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/prototype/, '/api'),
      },
    },
  },
});

