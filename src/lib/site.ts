import type { CollectionEntry } from "astro:content";

export type ProjectEntry = CollectionEntry<"projects">;
export type LogEntry = CollectionEntry<"logs">;

export const projectStatuses = {
  building: { label: "개발 중", tone: "active" },
  testing: { label: "테스트 중", tone: "testing" },
  maintained: { label: "운영 중", tone: "steady" },
} as const;

export const logKinds = {
  decision: "의사결정",
  build: "개발 기록",
  launch: "출시 기록",
  retrospective: "회고",
} as const;

export function withBase(path = "/") {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalizedPath}`;
}

export function projectPath(project: ProjectEntry | string) {
  const id = typeof project === "string" ? project : project.id;
  return withBase(`/projects/${id}`);
}

export function logPath(log: LogEntry) {
  const slug = log.id.split("/").at(-1);
  return withBase(`/projects/${log.data.project.id}/logs/${slug}`);
}

export function tagPath(tag: string) {
  return withBase(`/tags/${encodeURIComponent(tag)}`);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function sortProjects(projects: ProjectEntry[]) {
  return [...projects].sort((a, b) => a.data.order - b.data.order);
}

export function sortLogs(logs: LogEntry[]) {
  return [...logs].sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
}

export function publishedLogs(logs: LogEntry[]) {
  return sortLogs(logs.filter((log) => !log.data.draft));
}
