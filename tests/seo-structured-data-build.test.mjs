import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));

test("build renders safe article data and omits draft routes", async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), "blog-structured-data-"));
  const title = 'JSON-LD </script><script>alert("title")</script> 검증';
  const articlePath = "/blog/projects/wailing-wall/logs/98-structured-data-fixture/";

  try {
    await Promise.all([
      cp(join(root, "src"), join(fixtureRoot, "src"), { recursive: true }),
      cp(join(root, "public"), join(fixtureRoot, "public"), { recursive: true }),
      cp(join(root, "package.json"), join(fixtureRoot, "package.json")),
      cp(join(root, "astro.config.mjs"), join(fixtureRoot, "astro.config.mjs")),
      cp(join(root, "tsconfig.json"), join(fixtureRoot, "tsconfig.json")),
      symlink(join(root, "node_modules"), join(fixtureRoot, "node_modules"), "dir"),
    ]);
    const frontmatter = (draft) => `---
title: ${JSON.stringify(title)}
description: "빌드에서 실제 JSON-LD 출력을 확인합니다."
publishedAt: 2026-11-19
project: "wailing-wall"
kind: "build"
draft: ${draft}
---

테스트에서 생성한 글입니다.
`;
    const logs = join(fixtureRoot, "src/content/logs/wailing-wall");
    await writeFile(join(logs, "98-structured-data-fixture.md"), frontmatter(false));
    await writeFile(join(logs, "99-structured-data-draft.md"), frontmatter(true));

    const build = spawnSync(
      process.execPath,
      [join(root, "node_modules/astro/bin/astro.mjs"), "build"],
      { cwd: fixtureRoot, encoding: "utf8", timeout: 60_000 },
    );
    assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);

    const html = await readFile(
      join(fixtureRoot, "dist/projects/wailing-wall/logs/98-structured-data-fixture/index.html"),
      "utf8",
    );
    const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1, "published article has one JSON-LD graph");
    const data = JSON.parse(scripts[0][1]);
    const article = data["@graph"].find((entry) => entry["@type"] === "BlogPosting");
    const breadcrumb = data["@graph"].find((entry) => entry["@type"] === "BreadcrumbList");
    const url = `https://minimal1.github.io${articlePath}`;

    assert.equal(article.headline, title);
    assert.equal(article.url, url);
    assert.equal(article.mainEntityOfPage["@id"], url);
    assert.equal(article.datePublished, "2026-11-19T00:00:00.000Z");
    assert.equal(article.author.url, "https://minimal1.github.io/blog/about/");
    assert.equal(article.dateModified, undefined);
    assert.equal(article.image, undefined);
    assert.equal(breadcrumb.itemListElement.at(-1).item, url);
    assert.ok(!scripts[0][1].includes("</script"), "JSON cannot close its script element");
    assert.ok(!html.includes('<script>alert("title")</script>'));
    await assert.rejects(
      readFile(join(fixtureRoot, "dist/projects/wailing-wall/logs/99-structured-data-draft/index.html")),
      { code: "ENOENT" },
    );
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
