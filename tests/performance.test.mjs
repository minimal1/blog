import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { performancePages, summarizePerformance } from "../scripts/performance.mjs";

function site(t, pages) {
  const root = mkdtempSync(join(tmpdir(), "blog-performance-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [file, html] of Object.entries(pages)) {
    const path = join(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, html);
  }
  return root;
}

test("samples the newest built article and its project, with a stable date tie-break", (t) => {
  const root = site(t, {
    "index.html": "home",
    "projects/first/index.html": "project",
    "projects/second/index.html": "project",
    "projects/first/logs/old/index.html": '<time datetime="2026-01-01"></time>',
    "projects/second/logs/a/index.html": '<time datetime="2026-02-01"></time>',
    "projects/second/logs/z/index.html": '<time datetime="2026-02-01"></time>',
    "src/content/logs/draft.md": "draft: true\npublishedAt: 2099-01-01",
  });
  assert.deepEqual(performancePages(root), [
    "/blog/",
    "/blog/projects/second/",
    "/blog/projects/second/logs/z/",
  ]);
});

test("fails when no published article was built", (t) => {
  const root = site(t, { "index.html": "home", "projects/first/index.html": "project" });
  assert.throws(() => performancePages(root), /No published article/);
});

test("fails when an article has no usable publication time", (t) => {
  const root = site(t, {
    "index.html": "home",
    "projects/first/logs/article/index.html": '<time datetime="invalid"></time>',
  });
  assert.throws(() => performancePages(root), /publication time/);
});

test("fails before building when CHROME_PATH is not executable", (t) => {
  const root = site(t, {});
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("../scripts/performance.mjs", import.meta.url))], {
    cwd: root,
    env: { ...process.env, CHROME_PATH: join(root, "missing-chrome") },
    encoding: "utf8",
    timeout: 5000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ENOENT.*missing-chrome/);
});

function report(value) {
  return {
    requestedUrl: "http://127.0.0.1:4325/blog/",
    finalDisplayedUrl: "http://127.0.0.1:4325/blog/",
    configSettings: { formFactor: "mobile" },
    categories: { performance: { score: value / 100 } },
    audits: {
      "largest-contentful-paint": { numericValue: value * 10 },
      "cumulative-layout-shift": { numericValue: value / 1000 },
      "total-blocking-time": { numericValue: value },
    },
  };
}

test("reports each metric's median without enforcing a score budget", () => {
  const urls = [report(1).requestedUrl];
  const result = summarizePerformance([report(40), report(10), report(20)], urls);
  assert.match(result, /\| \/blog\/ \| 20 \| 200 \| 0\.020 \| 20 \|/);
});

test("fails on incomplete collection, runtime errors, missing metrics, or the wrong page", () => {
  const urls = [report(1).requestedUrl];
  assert.throws(() => summarizePerformance([report(10)], urls), /Expected 3/);
  for (const invalid of [
    { ...report(10), runtimeError: { message: "page failed" } },
    { ...report(10), audits: { ...report(10).audits, failed: { scoreDisplayMode: "error" } } },
    { ...report(10), audits: {} },
    { ...report(10), finalDisplayedUrl: "http://127.0.0.1:4325/blog/404/" },
  ]) {
    assert.throws(() => summarizePerformance([invalid, report(20), report(30)], urls));
  }
});
