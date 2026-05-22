import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

export default [
  // Base JS rules
  js.configs.recommended,

  // TypeScript config
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Import rules
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal"],
          "newlines-between": "always",
        },
      ],

      "import/no-unresolved": "off", // handled by TS

      // General rules
      "no-console": "warn",
    },
  },

  // Ignore files
  {
    ignores: ["dist", "node_modules", "*.config.ts"],
  },

  // Prettier compatibility (must be last)
  prettier,
];
