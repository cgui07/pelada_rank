import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importSort from "./eslint-plugins/import-sort.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "import-sort": importSort,
    },
    rules: {
      "import-sort/order": "warn",
    },
  },
]);

export default eslintConfig;
