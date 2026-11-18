## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Before creating or editing a project or development log, read and follow both
[`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md) and
[`WRITING_STYLE.md`](./WRITING_STYLE.md). They are the sources of truth for
content structure, publication state, prose, revision, and validation.

When creating or changing project introductions or development logs, read and use
[`content-seo-review`](./.agents/skills/content-seo-review/SKILL.md) after the three
revision passes in `WRITING_STYLE.md` and before finalizing publication state.
Record each verdict and its source evidence in the conversation or an authorized
PR description. Keep review tables out of the article. Missing facts require user
confirmation; a passing build does not establish factual accuracy or permission
to publish. See [`docs/seo-workflow.md`](./docs/seo-workflow.md) for local checks,
PR CI, Search Console setup, and recurring review.

When two or more projects are being written concurrently, also read and follow
[`WORKTREE_GUIDE.md`](./WORKTREE_GUIDE.md). Never let two sessions edit the same
worktree.

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
