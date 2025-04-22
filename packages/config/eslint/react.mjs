import { fixupPluginRules } from "@eslint/compat";
import reacteslint from "eslint-plugin-react";
import reacthookseslint from "eslint-plugin-react-hooks";

import base from "./typescript.mjs";

/**
 * Base typescript config + react.
 */
export default [
  ...base,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  reacteslint.configs.flat.recommended,
  reacteslint.configs.flat["jsx-runtime"],
  {
    plugins: {
      "react-hooks": fixupPluginRules(reacthookseslint),
    },
    rules: reacthookseslint.configs.recommended.rules,
  },
];
