import config from "eslint-config/react";

export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
];
