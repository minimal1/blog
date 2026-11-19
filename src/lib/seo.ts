// Astro.url includes base; Astro.site supplies the production origin even in dev.
// https://docs.astro.build/en/reference/api-reference/#url
export function canonicalURL(pageURL: URL, site: URL | undefined): URL {
  if (!site) {
    throw new Error("SEO canonical URLs require site in astro.config.mjs");
  }

  const canonical = new URL(pageURL.pathname, site);
  canonical.pathname = `${canonical.pathname.replace(/\/+$/, "")}/`;
  return canonical;
}
