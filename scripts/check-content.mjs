import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fromMarkdown } from "mdast-util-from-markdown";
import { isMap, parseDocument } from "yaml";

const normalize = (value) => value.normalize("NFC").replace(/\s+/gu, " ").trim().toLowerCase();
const lineAt = (source, offset = 0) => source.slice(0, offset).split("\n").length;

/** Check authored metadata and Markdown structure without interpreting prose as facts. */
export function reviewContent(files) {
  const entries = [];
  const issues = [];
  const seen = { title: new Map(), description: new Map() };

  for (const file of files) {
    const match = /^src\/content\/(projects|logs)\/(.+)\.mdx?$/.exec(file.path);
    if (!match) continue;
    const [, collection, fileId] = match;
    const report = (line, message) => issues.push({ path: file.path, line, message });
    const frontmatter = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(file.source);
    if (!frontmatter) {
      report(1, "YAML Frontmatter가 필요합니다.");
      continue;
    }
    const document = parseDocument(frontmatter[1]);
    if (document.errors.length || !isMap(document.contents)) {
      report(2, "YAML Frontmatter를 확인하세요. 매핑 형식과 중복 키를 검사하세요.");
      continue;
    }
    const metadata = document.toJS({ maxAliasCount: 100 });
    const fieldLine = (field) => {
      const pair = document.contents.items.find((item) => item.key?.value === field);
      return 1 + lineAt(frontmatter[1], pair?.key?.range?.[0]);
    };
    for (const field of ["title", collection === "projects" ? "summary" : "description"]) {
      if (typeof metadata[field] !== "string" || !metadata[field].trim()) {
        report(fieldLine(field), `${field}은 공백이 아닌 문자열이어야 합니다.`);
      }
    }
    if (collection === "logs" && metadata.draft !== undefined && typeof metadata.draft !== "boolean") {
      report(fieldLine("draft"), "draft는 true 또는 false인 불리언이어야 합니다.");
    }
    const entry = {
      path: file.path,
      id: typeof metadata.slug === "string" ? metadata.slug : fileId,
      project: metadata.project,
      draft: collection === "logs" && metadata.draft === true,
    };
    entries.push(entry);

    if (!entry.draft) {
      for (const field of ["title", collection === "projects" ? "summary" : "description"]) {
        if (typeof metadata[field] !== "string" || !metadata[field].trim()) continue;
        const values = seen[field === "summary" ? "description" : field];
        const value = normalize(metadata[field]);
        const original = values.get(value);
        if (original) {
          report(fieldLine(field), `${field}이 공개 콘텐츠 ${original}와 중복됩니다.`);
        } else {
          values.set(value, `${file.path}:${fieldLine(field)}`);
        }
      }
    }

    const body = file.source.slice(frontmatter[0].length);
    const bodyLine = lineAt(file.source, frontmatter[0].length);
    const visit = (node) => {
      if (node.type === "heading" && node.depth === 1) {
        report(bodyLine + node.position.start.line - 1, "본문 H1은 레이아웃의 제목과 겹칩니다. 소제목은 H2부터 작성하세요.");
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(fromMarkdown(body));
  }
  return { entries, issues };
}

/** Match current Astro directory and file output formats, relative to dist/. */
export function checkDraftRoutes(entries, outputPaths) {
  const output = new Set(outputPaths);
  return entries.filter((entry) => {
    if (!entry.draft || typeof entry.project !== "string") return false;
    const route = `projects/${entry.project}/logs/${entry.id.split("/").at(-1)}`;
    return output.has(`${route}/index.html`) || output.has(`${route}.html`);
  }).map((entry) => ({
    path: entry.path,
    line: 1,
    message: "초안의 개별 페이지가 공개 빌드에 포함됐습니다.",
  }));
}

async function listFiles(directory, root = directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(filename, root));
    else if (entry.isFile()) files.push(path.relative(root, filename).split(path.sep).join("/"));
  }
  return files.sort();
}

async function main() {
  const filenames = (await listFiles("src/content")).filter((file) => /^(projects|logs)\/.+\.mdx?$/.test(file));
  const files = await Promise.all(filenames.map(async (file) => ({
    path: `src/content/${file}`,
    source: await readFile(`src/content/${file}`, "utf8"),
  })));
  const { entries, issues } = reviewContent(files);
  if (process.argv.includes("--built")) {
    issues.push(...checkDraftRoutes(entries, await listFiles("dist")));
  }
  for (const issue of issues) console.error(`${issue.path}:${issue.line}: ${issue.message}`);
  if (issues.length) process.exitCode = 1;
  else console.log(`${entries.length}개 콘텐츠의 정적 검사를 통과했습니다. 사실성과 발행 승인은 별도 검토가 필요합니다.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
