import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  envPrefix: "REACT_APP_",
  server: { watch: { usePolling: true } },
  build: { outDir: "build" },
  test: { environment: "jsdom", setupFiles: ["./src/setupTests.js"] },
});
