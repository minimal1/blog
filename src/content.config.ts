import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection, reference } from "astro:content";

const season1 = defineCollection({
  loader: glob({
    base: "./src/posts/season1",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
  }),
});

const projects = defineCollection({
  loader: glob({
    base: "./src/content/projects",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(["building", "testing", "maintained"]),
    startedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    order: z.number(),
    links: z
      .object({
        website: z.url().optional(),
        repository: z.url().optional(),
      })
      .optional(),
    milestones: z.array(
      z.object({
        label: z.string(),
        state: z.enum(["done", "current", "upcoming"]),
      }),
    ),
  }),
});

const logs = defineCollection({
  loader: glob({
    base: "./src/content/logs",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    project: reference("projects"),
    kind: z.enum(["decision", "build", "launch", "retrospective"]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { season1, projects, logs };
