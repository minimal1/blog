import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const site = "https://minimal1.github.io";
let fixture;
let urls;

function locations(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

before(async () => {
  fixture = await mkdtemp(join(tmpdir(), "blog-seo-sitemap-"));
  for (const path of ["src", "public", "package.json", "astro.config.mjs", "tsconfig.json"]) {
    await cp(join(root, path), join(fixture, path), { recursive: true });
  }
  await symlink(join(root, "node_modules"), join(fixture, "node_modules"), "dir");

  for (const draft of [false, true]) {
    const slug = draft ? "99-seo-draft-fixture" : "98-seo-published-fixture";
    await writeFile(join(fixture, "src/content/logs/acp-harbor", `${slug}.md`), `---
title: "Sitemap publication fixture"
description: "Checks whether publication state controls generated routes."
publishedAt: 2026-01-01
project: "acp-harbor"
kind: "build"
draft: ${draft}
---
This content exists only in a temporary test project.
`);
  }

  execFileSync(process.execPath, [join(root, "node_modules/astro/bin/astro.mjs"), "build"], {
    cwd: fixture,
    stdio: "pipe",
  });

  const index = await readFile(join(fixture, "dist/sitemap-index.xml"), "utf8");
  const sitemapURLs = locations(index);
  assert.ok(sitemapURLs.length > 0, "The sitemap index must reference a sitemap.");
  urls = [];
  for (const url of sitemapURLs) {
    assert.match(url, /^https:\/\/minimal1\.github\.io\/blog\/sitemap-\d+\.xml$/);
    const filename = new URL(url).pathname.slice("/blog/".length);
    const xml = await readFile(join(fixture, "dist", filename), "utf8");
    urls.push(...locations(xml));
  }
});

after(async () => {
  if (fixture) await rm(fixture, { recursive: true, force: true });
});

test("sitemap lists every generated HTML page using the production /blog base", async () => {
  const files = await readdir(join(fixture, "dist"), { recursive: true });
  const pageURLs = files
    .filter((path) => path.endsWith("index.html"))
    .map((path) => new URL(`/blog/${path.slice(0, -"index.html".length)}`, site).href);

  assert.deepEqual([...urls].sort(), pageURLs.sort());
  assert.equal(new Set(urls).size, urls.length, "A page must appear only once.");
  assert.ok(urls.every((url) => url.startsWith(`${site}/blog/`) && url.endsWith("/")));
  assert.ok(urls.includes(`${site}/blog/`));
  assert.ok(urls.includes(`${site}/blog/projects/acp-harbor/`));
});

test("new published logs are discovered automatically while draft logs stay out", async () => {
  assert.ok(urls.includes(`${site}/blog/projects/acp-harbor/logs/98-seo-published-fixture/`));
  assert.ok(!urls.some((url) => url.includes("99-seo-draft-fixture")));
  const files = await readdir(join(fixture, "dist"), { recursive: true });
  assert.ok(!files.some((path) => path.includes("99-seo-draft-fixture")));
});
