import assert from "node:assert/strict";
import test from "node:test";
import { createArticleStructuredData, serializeJsonLd } from "../src/lib/structured-data.ts";

function articleData() {
  return {
    title: "사내 익명 커뮤니티에서 댓글을 없앤 이유",
    description: "공유 부담을 줄이기 위한 선택과 아직 확인하지 못한 결과.",
    publishedAt: new Date("2026-11-12T00:00:00.000Z"),
    url: new URL("https://minimal1.github.io/blog/projects/wailing-wall/logs/01-why-no-comments"),
    authorUrl: new URL("https://minimal1.github.io/blog/about"),
    projectsUrl: new URL("https://minimal1.github.io/blog/projects"),
    project: {
      name: "통곡의 벽",
      url: new URL("https://minimal1.github.io/blog/projects/wailing-wall"),
    },
  };
}

test("uses the actual title, description, date and author without invented metadata", () => {
  const input = articleData();
  const graph = createArticleStructuredData(input);
  const article = graph["@graph"][0];
  assert.equal(graph["@context"], "https://schema.org");
  assert.equal(article["@type"], "BlogPosting");
  assert.equal(article.headline, input.title);
  assert.equal(article.description, input.description);
  assert.equal(article.datePublished, "2026-11-12T00:00:00.000Z");
  assert.equal(article.inLanguage, "ko");
  assert.deepEqual(article.author, {
    "@type": "Person",
    name: "Minimal",
    url: "https://minimal1.github.io/blog/about/",
  });
  assert.equal(article.dateModified, undefined);
  assert.equal(article.image, undefined);
});

test("normalizes absolute URLs, keeps /blog, and excludes tracking and fragments", () => {
  const input = articleData();
  input.url.search = "?utm_source=shared";
  input.url.hash = "#details";
  input.project.url.search = "?source=log";
  const graph = createArticleStructuredData(input);
  const article = graph["@graph"][0];
  const expected = "https://minimal1.github.io/blog/projects/wailing-wall/logs/01-why-no-comments/";
  assert.equal(article.url, expected);
  assert.equal(article["@id"], `${expected}#article`);
  assert.equal(article.mainEntityOfPage["@id"], expected);
  assert.equal(input.url.search, "?utm_source=shared", "input URLs remain unchanged");
  assert.equal(
    graph["@graph"][1].itemListElement[1].item,
    "https://minimal1.github.io/blog/projects/wailing-wall/",
  );
});

test("describes the projects-to-article navigation in consecutive breadcrumb positions", () => {
  const breadcrumb = createArticleStructuredData(articleData())["@graph"][1];
  assert.equal(breadcrumb["@type"], "BreadcrumbList");
  assert.deepEqual(breadcrumb.itemListElement.map(({ name, position }) => ({ name, position })), [
    { name: "프로젝트", position: 1 },
    { name: "통곡의 벽", position: 2 },
    { name: "사내 익명 커뮤니티에서 댓글을 없앤 이유", position: 3 },
  ]);
  assert.ok(breadcrumb.itemListElement.every((item) => item["@type"] === "ListItem"));
});

test("serializes untrusted text without allowing script termination and preserves JSON values", () => {
  const input = articleData();
  input.title = '</ScRiPt><script>alert("title")</script>';
  input.description = "<!-- & > \u2028 \u2029";
  const data = createArticleStructuredData(input);
  const json = serializeJsonLd(data);
  assert.ok(!json.includes("<"));
  assert.deepEqual(JSON.parse(json), data);
});
