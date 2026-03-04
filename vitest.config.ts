import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/*.integration.test.ts",
      "src/**/*.integration.test.tsx",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/server/modules/auth/service.ts",
        "src/server/modules/group/service.ts",
        "src/server/modules/pelada/service.ts",
        "src/server/modules/pelada/ranking.ts",
      ],
      thresholds: {
        lines: 45,
        functions: 45,
        statements: 45,
        branches: 40,
      },
    },
  },
});
