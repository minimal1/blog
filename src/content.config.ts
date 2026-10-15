import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const season1 = defineCollection({
  loader: glob({
    base: "./src/posts/season1",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { season1 };
