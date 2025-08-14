import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      "unused-imports": unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],
      "spaced-comment": ["error", "never"],
      "line-comment-position": ["error", { "position": "above" }],
      "no-inline-comments": "error",
      "multiline-comment-style": ["error", "starred-block"],
      "eol-last": ["error", "always"],
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "arrow-spacing": "error",
      "prefer-template": "error",
      "template-curly-spacing": "error",
      "no-useless-concat": "error",
      "no-restricted-imports": [
        "error", 
        {
          "patterns": [
            {
              "group": ["../*", "../../*", "../../../*", "../../../../*"],
              "message": "Use absolute imports (@ prefixed) instead of relative imports with '../'"
            }
          ]
        }
      ],
      "no-useless-return": "error",
      "no-else-return": "error",
      "prefer-destructuring": ["error", {
        "array": true,
        "object": true
      }],
      "no-magic-numbers": ["error", { 
        "ignore": [0, 1, -1], 
        "ignoreArrayIndexes": true,
        "detectObjects": false 
      }],
      "complexity": ["error", 10],
      "max-depth": ["error", 4],
      "max-lines-per-function": ["error", { "max": 50, "skipBlankLines": true, "skipComments": true }],
      "max-params": ["error", 4],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    files: [
      "**/logger.ts",
      "**/logging/**/*.ts", 
      "**/cli/**/*.ts",
      "**/run.ts"
    ],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: [
      "dist/**/*",
      "node_modules/**/*",
      "coverage/**/*",
      "*.config.js",
      "mock_server/**/*",
    ],
  }
);
