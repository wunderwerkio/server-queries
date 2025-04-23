import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/loader.ts"],
  outDir: "./dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "node16",
  format: "cjs",
  dts: true,
});
