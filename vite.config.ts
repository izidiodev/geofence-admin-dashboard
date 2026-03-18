/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/DS": path.resolve(__dirname, "./src/ds"),
      "@/Routes": path.resolve(__dirname, "./src/routes"),
      "@modules": path.resolve(__dirname, "./src/modules"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-chakra": ["@chakra-ui/react", "@emotion/react", "@emotion/styled"],
          "vendor-forms": ["react-hook-form", "axios"],
        },
      },
    },
  },
});
