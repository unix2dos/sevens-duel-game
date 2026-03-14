import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/__tests__/**/*.ts", "src/**/__tests__/**/*.tsx"],
    exclude: ["e2e/**"],
  },
});
