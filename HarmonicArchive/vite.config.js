import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

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
    host: '192.168.100.6', // Use your machine's correct IP address
    port: 5173,
  },
});