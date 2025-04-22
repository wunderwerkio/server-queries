import jsdoceslint from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

import base from "./base.mjs";

export default tseslint.config(
  ...base,
  ...tseslint.configs.recommendedTypeChecked,
  jsdoceslint.configs["flat/recommended-typescript"],
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "never",
        },
      ],
      "jsdoc/require-returns": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-description-complete-sentence": [
        "warn",
        { abbreviations: ["etc", "e.g.", "i.e."] },
      ],
      "jsdoc/require-hyphen-before-param-description": "warn",
      "jsdoc/no-blank-block-descriptions": "error",
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: false,
          exemptEmptyFunctions: false,
          exemptEmptyConstructors: false,
          require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: false,
            ClassExpression: false,
            FunctionDeclaration: false,
            FunctionExpression: false,
            MethodDefinition: false,
          },
          contexts: [
            "ClassDeclaration",
            "ClassExpression",
            // Select a FunctionDeclaration that is not a descendant of
            // another FunctionDeclaration.
            ":function:not(:function :function):not(CallExpression > :function):not(Property > :function)",
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.stories.tsx", "**/*.stories.ts"],
    rules: {
      "no-case-declarations": "off",
      "no-console": "off",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
        },
      ],
    },
  },
);
