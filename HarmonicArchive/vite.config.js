import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { BASE_IP } from "./config";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        format: "es", // Ensure ES module output for compatibility
      },
    },
  },
  worker: {
    format: "es", // Enable ES module format for Web Workers
  },
  server: {
    host: BASE_IP, // Use your machine's correct IP address
    port: 5173,
  },
});