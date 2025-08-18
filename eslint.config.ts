import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import banComments from "eslint-plugin-ban-comments";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      "unused-imports": unusedImports,
      "ban-comments": banComments,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: "tsconfig.json",
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
      "ban-comments/ban-comments": ["error", {
        "allowJSDoc": true
      }],
      "spaced-comment": ["error", "always"],
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
      "**/run.ts",
      "tests/**"
    ],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/__tests__/**/*", "**/*.test.ts", "**/*.spec.ts", "tests/**/*"],
    languageOptions: {
      parserOptions: {
        project: "tsconfig.test.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "max-lines-per-function": "off",
      "no-magic-numbers": "off",
      "complexity": "off",
      "max-params": "off",
      "max-depth": "off",
      "prefer-destructuring": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "spaced-comment": ["error", "always"],
    },
  },
  {
    ignores: [
      "dist/**/*",
      "node_modules/**/*",
      "coverage/**/*",
      "*.config.ts",
      "eslint.config.ts",
      "scripts/**/*",
    ],
  }
);
