import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  // /calc/ のようなサブパスで配信するため、アセットは相対パスで参照する
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  test: {
    root: ".",
    include: ["test/**/*.test.js"],
  },
});
