import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 5173 },
  build: {
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        ecma: 2015, // Explicitly target ES2015
      },
      mangle: {
        safari10: true, // Better Safari/WebView support
      },
      format: {
        comments: false,
      },
    },
  },
  esbuild: {
    target: "es2015",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2015",
    },
  },
});
