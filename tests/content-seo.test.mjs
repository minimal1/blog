import assert from "node:assert/strict";
import test from "node:test";
import { checkDraftRoutes, reviewContent } from "../scripts/check-content.mjs";

function log(name, metadata = "", body = "확인한 결과를 기록했다.") {
  return {
    path: `src/content/logs/sample/${name}.md`,
    source: `---\ntitle: "${name}"\ndescription: "${name}의 결정 근거"\nproject: sample\ndraft: false\n${metadata}---\n${body}\n`,
  };
}

test("reports blank authored metadata with a source location", () => {
  const file = log("01-empty");
  file.source = file.source.replace('title: "01-empty"', 'title: "  "');
  const { issues } = reviewContent([file]);
  assert.deepEqual(issues, [{
    path: file.path,
    line: 2,
    message: "title은 공백이 아닌 문자열이어야 합니다.",
  }]);
});

test("requires a project summary and a log description", () => {
  const { issues } = reviewContent([
    { path: "src/content/projects/sample.md", source: "---\ntitle: Sample\n---\n본문" },
    { path: "src/content/logs/sample/01-log.md", source: "---\ntitle: 기록\n---\n본문" },
  ]);
  assert.equal(issues.length, 2);
  assert.match(issues[0].message, /summary/);
  assert.match(issues[1].message, /description/);
});

test("parses folded YAML and ignores metadata-like text in fenced examples", () => {
  const file = log("01-valid", "", "```yaml\ntitle: ''\n---\n# 예시 제목\n```\n\n## 확인한 결과\n[제목](#example)과 ![설명](./image.png)");
  file.source = file.source.replace('description: "01-valid의 결정 근거"', "description: >-\n  YAML을 여러 줄로\n  기록한 근거");
  assert.deepEqual(reviewContent([file]).issues, []);
});

test("rejects missing frontmatter and duplicate YAML keys", () => {
  const { issues } = reviewContent([
    { path: "src/content/projects/missing.md", source: "# Frontmatter 없음" },
    log("01-yaml", "title: 다시 쓴 제목\n"),
  ]);
  assert.equal(issues.length, 2);
  assert.match(issues[0].message, /Frontmatter/);
  assert.match(issues[1].message, /YAML/);
});

test("finds normalized duplicate titles and summaries across public collections", () => {
  const project = {
    path: "src/content/projects/sample.md",
    source: '---\ntitle: "Sample   결과"\nsummary: "확인한  근거"\n---\n본문',
  };
  const file = log("01-duplicate");
  file.source = file.source
    .replace('title: "01-duplicate"', 'title: "sample 결과"')
    .replace('description: "01-duplicate의 결정 근거"', 'description: "확인한 근거"');
  const { issues } = reviewContent([project, file]);
  assert.equal(issues.length, 2);
  assert.ok(issues.every((issue) => issue.message.includes(`${project.path}:`)));
});

test("allows draft revisions to share published metadata", () => {
  const published = log("01-original");
  const draft = { ...published, path: "src/content/logs/sample/02-revision.md" };
  draft.source = draft.source.replace("draft: false", "draft: true");
  assert.deepEqual(reviewContent([published, draft]).issues, []);
});

test("preserves the existing default-public rule and rejects quoted draft values", () => {
  const published = log("01-public");
  published.source = published.source.replace("draft: false\n", "");
  const draft = log("02-invalid");
  draft.source = draft.source.replace("draft: false", 'draft: "true"');
  const { entries, issues } = reviewContent([published, draft]);
  assert.equal(entries[0].draft, false);
  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /draft/);
});

test("detects ATX and setext body H1 headings without flagging code examples", () => {
  const { issues } = reviewContent([
    log("01-heading", "", "# 본문 제목\n\n## 소제목"),
    log("02-heading", "", "본문 제목\n===\n\n```md\n# 코드 예시\n```"),
  ]);
  assert.equal(issues.length, 2);
  assert.ok(issues.every((issue) => issue.message.includes("H1")));
  assert.equal(issues[0].line, 7);
});

test("does not interpret H1-like lines in MDX JavaScript exports as headings", () => {
  const file = log("01-mdx", "", "export const example = `\n# 문자열 내용\n`;\n\n## 본문 소제목");
  file.path = file.path.replace(/\.md$/, ".mdx");
  assert.deepEqual(reviewContent([file]).issues, []);
});

test("keeps metadata validation for MDX files", () => {
  const file = log("01-mdx");
  file.path = file.path.replace(/\.md$/, ".mdx");
  file.source = file.source.replace('title: "01-mdx"', 'title: " "');
  const { issues } = reviewContent([file]);
  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /title/);
});

test("excludes legacy season1 content from the authored-content policy", () => {
  assert.deepEqual(reviewContent([
    { path: "src/posts/season1/old.md", source: "# Frontmatter 없는 이전 글" },
  ]), { entries: [], issues: [] });
});

test("rejects a built draft page while allowing published pages", () => {
  const draft = log("02-private");
  draft.source = draft.source.replace("draft: false", "draft: true");
  const { entries } = reviewContent([log("01-public"), draft]);
  assert.deepEqual(checkDraftRoutes(entries, [
    "projects/sample/logs/01-public/index.html",
  ]), []);
  const issues = checkDraftRoutes(entries, [
    "projects/sample/logs/02-private/index.html",
  ]);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].path, draft.path);
  assert.match(issues[0].message, /초안.*공개/);
});

test("checks file-format output and a frontmatter slug override for draft leaks", () => {
  const draft = log("02-private", 'slug: "sample/custom-draft"\n');
  draft.source = draft.source.replace("draft: false", "draft: true");
  const { entries } = reviewContent([draft]);
  assert.equal(checkDraftRoutes(entries, ["projects/sample/logs/custom-draft.html"]).length, 1);
});
