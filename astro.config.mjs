// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://minimal1.github.io",
  base: "/blog",
  markdown: {
    shikiConfig: {
      themes: {
        light: "rose-pine-dawn",
        dark: "rose-pine",
      },
    },
  },
});
