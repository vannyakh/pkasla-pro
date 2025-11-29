import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow 'any' types (downgrade from error to warning)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused variables (downgrade from error to warning)
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow img tags (downgrade from error to warning)
      "@next/next/no-img-element": "warn",
      // Allow React hooks issues (downgrade from error to warning)
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/incompatible-library": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);

export default eslintConfig;
