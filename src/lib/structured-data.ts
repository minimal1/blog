interface ArticleData {
  title: string;
  description: string;
  publishedAt: Date;
  url: URL;
  authorUrl: URL;
  projectsUrl: URL;
  project: {
    name: string;
    url: URL;
  };
}

function pageUrl(value: URL) {
  const url = new URL(value);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/`;
  url.search = "";
  url.hash = "";
  return url.href;
}

export function createArticleStructuredData(data: ArticleData) {
  const url = pageUrl(data.url);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        url,
        headline: data.title,
        description: data.description,
        datePublished: data.publishedAt.toISOString(),
        inLanguage: "ko",
        author: {
          "@type": "Person",
          name: "Minimal",
          url: pageUrl(data.authorUrl),
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { name: "프로젝트", item: pageUrl(data.projectsUrl) },
          { name: data.project.name, item: pageUrl(data.project.url) },
          { name: data.title, item: url },
        ].map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          ...item,
        })),
      },
    ],
  };
}

export function serializeJsonLd(data: ReturnType<typeof createArticleStructuredData>) {
  // set:html does not escape HTML. A literal '<' could terminate the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
