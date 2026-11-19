import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
  );
}

function metadata(html) {
  return [...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => attributes(tag));
}

test("canonical URLs use the configured origin, retain encoded paths and omit tracking parameters", async () => {
  const { canonicalURL } = await import("../src/lib/seo.ts");
  const site = new URL("https://minimal1.github.io");

  for (const path of ["/blog/", "/blog/logs", "/blog/logs/", "/blog/tags/게임개발/", "/blog/tags/%EA%B2%8C%EC%9E%84%EA%B0%9C%EB%B0%9C/"]) {
    const input = new URL(`${path}?utm_source=shared#content`, "http://localhost:4322");
    const expected = new URL(`${path.replace(/\/+$/, "")}/`, site);
    assert.equal(canonicalURL(input, site).href, expected.href);
  }
  assert.throws(() => canonicalURL(new URL("http://localhost/blog/"), undefined), /site/);
});

test("every generated page shares its canonical URL and content across search and social tags", async () => {
  const files = (await readdir(dist, { recursive: true })).filter((file) => file.endsWith(".html"));
  assert.ok(files.length > 0, "Run pnpm build before this test");

  for (const file of files) {
    const html = await readFile(new URL(file, dist), "utf8");
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const meta = metadata(html);
    const value = (key) => meta.find((entry) => entry.name === key || entry.property === key)?.content;
    const canonical = [...html.matchAll(/<link\s[^>]*>/g)]
      .map(([tag]) => attributes(tag))
      .filter((entry) => entry.rel === "canonical");
    const expectedPath = `/blog/${file.replace(/index\.html$/, "")}`;
    const expectedURL = new URL(expectedPath, "https://minimal1.github.io").href;

    assert.ok(title?.trim(), `${file}: title`);
    assert.ok(value("description")?.trim(), `${file}: description`);
    assert.equal(canonical.length, 1, `${file}: one canonical link`);
    assert.equal(canonical[0].href, expectedURL, `${file}: production URL with /blog and trailing slash`);
    assert.equal(value("og:url"), expectedURL, `${file}: social URL`);
    assert.equal(value("og:title"), title, `${file}: social title`);
    assert.equal(value("og:description"), value("description"), `${file}: social description`);
    assert.equal(value("og:locale"), "ko_KR", `${file}: locale`);
    assert.equal(value("og:site_name"), "미니멀의 빌드 로그", `${file}: site name`);
    assert.equal(value("og:image"), "https://minimal1.github.io/blog/social-preview.png", `${file}: shared default image`);
    assert.equal(value("og:image:type"), "image/png", `${file}: image type`);
    assert.equal(value("og:image:width"), "1200", `${file}: image width`);
    assert.equal(value("og:image:height"), "630", `${file}: image height`);
    assert.ok(value("og:image:alt")?.trim(), `${file}: image alternative text`);
    assert.equal(value("twitter:card"), "summary_large_image", `${file}: social card`);
    assert.equal(value("twitter:title"), title, `${file}: Twitter title`);
    assert.equal(value("twitter:description"), value("description"), `${file}: Twitter description`);
    assert.equal(value("twitter:image"), value("og:image"), `${file}: Twitter image`);
    assert.equal(value("twitter:image:alt"), value("og:image:alt"), `${file}: Twitter image alternative text`);
    assert.equal(value("og:type"), /\/logs\/[^/]+\/index\.html$|^season1\/[^/]+\/index\.html$/.test(file) ? "article" : "website", `${file}: page type`);
    assert.match(html, /<link rel="sitemap" href="\/blog\/sitemap-index\.xml"/, `${file}: sitemap discovery`);
  }
});

test("the default social preview is a deployed PNG with the declared dimensions", async () => {
  const image = await readFile(new URL("social-preview.png", dist));
  assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

test("legacy articles use their own title and stored description", async () => {
  for (const [slug, title] of [["first-post", "첫글 개시!"], ["second-post", "두번째글 개시!"]]) {
    const html = await readFile(new URL(`season1/${slug}/index.html`, dist), "utf8");
    assert.ok(html.includes(`<title>${title} · 미니멀의 빌드 로그</title>`));
    assert.equal(metadata(html).find((entry) => entry.name === "description")?.content, "개인 블로그의 첫번째 포스팅입니다");
  }
});

test("overview pages have descriptions specific to their contents", async () => {
  const paths = ["index.html", "about/index.html", "logs/index.html", "projects/index.html", "tags/index.html", "season1/index.html"];
  const descriptions = await Promise.all(paths.map(async (path) => {
    const html = await readFile(new URL(path, dist), "utf8");
    return metadata(html).find((entry) => entry.name === "description")?.content;
  }));
  assert.equal(new Set(descriptions).size, paths.length);
});
