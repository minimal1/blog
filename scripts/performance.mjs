import {
  accessSync, appendFileSync, constants, existsSync, mkdirSync,
  mkdtempSync, readdirSync, readFileSync, writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const origin = "http://127.0.0.1:4325";
const runs = 3;
const lhci = "@lhci/cli@0.16.1";
const metrics = ["largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time"];

export function performancePages(dist) {
  const articles = readdirSync(dist, { recursive: true })
    .map((file) => file.replaceAll("\\", "/"))
    .filter((file) => /^projects\/[^/]+\/logs\/[^/]+\/index\.html$/.test(file))
    .map((file) => {
      const html = readFileSync(resolve(dist, file), "utf8");
      const datetime = html.match(/<time\b[^>]*\bdatetime=["']([^"']+)["']/i)?.[1];
      const publishedAt = Date.parse(datetime ?? "");
      if (!Number.isFinite(publishedAt)) throw new Error(`Missing publication time: ${file}`);
      return { file, publishedAt };
    })
    .sort((a, b) => b.publishedAt - a.publishedAt || (a.file < b.file ? 1 : a.file > b.file ? -1 : 0));

  if (!articles.length) throw new Error("No published article in the build output");
  const article = articles[0].file;
  const project = article.split("/").slice(0, 2).join("/");
  for (const file of ["index.html", `${project}/index.html`]) {
    if (!existsSync(resolve(dist, file))) throw new Error(`Missing built page: ${file}`);
  }
  return ["/blog/", `/blog/${project}/`, `/blog/${article.replace(/index\.html$/, "")}`];
}

export function summarizePerformance(reports, urls) {
  if (reports.length !== urls.length * runs) throw new Error(`Expected ${urls.length * runs} Lighthouse reports`);
  const rows = urls.map((url) => {
    const samples = reports.filter((report) => report.requestedUrl === url);
    if (samples.length !== runs) throw new Error(`Expected ${runs} runs for ${url}`);
    const values = samples.map((report) => {
      if (report.runtimeError) throw new Error(`Lighthouse runtime error: ${report.runtimeError.message}`);
      if (Object.values(report.audits ?? {}).some((audit) => audit.scoreDisplayMode === "error")) {
        throw new Error(`Lighthouse audit failed: ${url}`);
      }
      if ((report.finalDisplayedUrl ?? report.finalUrl) !== url || report.configSettings?.formFactor !== "mobile") {
        throw new Error(`Unexpected page or emulation: ${url}`);
      }
      const result = [report.categories?.performance?.score, ...metrics.map((id) => report.audits?.[id]?.numericValue)];
      if (result.some((value) => !Number.isFinite(value) || value < 0)) throw new Error(`Missing metric: ${url}`);
      return result;
    });
    const median = (index) => values.map((value) => value[index]).sort((a, b) => a - b)[1];
    return `| ${new URL(url).pathname} | ${Math.round(median(0) * 100)} | ${Math.round(median(1))} | ${median(2).toFixed(3)} | ${Math.round(median(3))} |`;
  });
  return [
    "## Mobile Lighthouse (lab)",
    "",
    "Three runs per page; each column is its own median. Reporting only: no score budget.",
    "",
    "| Page | Performance | LCP (ms) | CLS | TBT (ms) |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...rows,
    "",
    "LCP, CLS and TBT are lab measurements. TBT is not field INP; this run does not establish a Core Web Vitals pass.",
    "",
  ].join("\n");
}

function pnpm(args) {
  const result = spawnSync("pnpm", args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`pnpm ${args[0]} failed (${result.status ?? result.signal})`);
}

async function run() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 19)) {
    throw new Error("Performance measurement requires Node.js >=22.19.0; CI uses 24.22.3");
  }
  const chromePath = process.env.CHROME_PATH;
  if (chromePath) accessSync(chromePath, constants.X_OK);
  pnpm(["build"]);
  const urls = performancePages(resolve("dist")).map((page) => `${origin}${page}`);
  // Refuse to audit a different process already listening on the reserved port.
  await new Promise((done, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(4325, "127.0.0.1", () => probe.close(done));
  });
  mkdirSync("reports/performance", { recursive: true });
  const output = mkdtempSync(resolve("reports/performance/run-"));
  const config = resolve(output, "lighthouserc.json");
  writeFileSync(config, JSON.stringify({
    ci: {
      collect: {
        method: "node",
        chromePath,
        url: urls,
        numberOfRuns: runs,
        startServerCommand: "pnpm exec astro preview --host 127.0.0.1 --port 4325",
        startServerReadyPattern: "http://127\\.0\\.0\\.1:4325",
        settings: {
          onlyCategories: ["performance"],
          formFactor: "mobile",
          throttlingMethod: "simulate",
          // Lighthouse/chrome-launcher creates and cleans a fresh temporary profile per run.
          disableStorageReset: false,
        },
      },
      upload: { target: "filesystem", outputDir: output },
    },
  }, null, 2));
  console.log(`Measuring ${urls.join(", ")}\nReports: ${output}`);
  pnpm(["dlx", lhci, "collect", `--config=${config}`]);
  const reports = readdirSync(".lighthouseci")
    .filter((file) => /^lhr-.*\.json$/.test(file))
    .map((file) => JSON.parse(readFileSync(resolve(".lighthouseci", file), "utf8")));
  const summary = summarizePerformance(reports, urls)
    + `\nLHCI: ${lhci}; Lighthouse: ${reports[0].lighthouseVersion}; Node: ${process.version}.\n`
    + `Browser: ${reports[0].environment.hostUserAgent}.\n`;
  // Explicit filesystem target also takes precedence over any ambient LHCI environment variable.
  pnpm(["dlx", lhci, "upload", `--config=${config}`, "--target=filesystem", `--outputDir=${output}`]);
  writeFileSync(resolve(output, "summary.md"), summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
