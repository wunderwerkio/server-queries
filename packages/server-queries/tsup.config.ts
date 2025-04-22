import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "./src/entry/client.ts",
    "./src/entry/server.ts",
    "./src/entry/results.ts",
    "./src/entry/webpack-loader.ts",
  ],
  outDir: "./dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "es6",
  format: "esm",
  dts: true,
});
