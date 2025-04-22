import eslint from "@eslint/js";
import prettiereslint from "eslint-config-prettier";
import jsdoceslint from "eslint-plugin-jsdoc";

/**
 * The base eslint config for typescript.
 */
export default [
  eslint.configs.recommended,
  jsdoceslint.configs["flat/recommended"],
  prettiereslint,
  {
    rules: {
      "no-var": "warn",
      "no-empty": "warn",
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": [
        "warn",
        {
          allow: ["assert"],
        },
      ],
      "no-fallthrough": "warn",
      "no-case-declarations": "error",
      "no-self-assign": "warn",
      "new-cap": "off",
      "no-undefined": "off",
      "no-global-assign": "error",
      "prefer-const": "error",
      "dot-notation": "error",
      "no-useless-catch": "error",
      "no-prototype-builtins": "off",
      "jsdoc/require-description-complete-sentence": [
        "warn",
        { abbreviations: ["etc", "e.g.", "i.e."] },
      ],
      "jsdoc/require-hyphen-before-param-description": "warn",
      "jsdoc/no-blank-block-descriptions": "error",
      "jsdoc/tag-lines": ["warn" | "warn", "never", { startLines: 1 }],
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
];
