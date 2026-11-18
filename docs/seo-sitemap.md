# 사이트맵 운영

`@astrojs/sitemap`이 `pnpm build`에서 생성된 페이지를 모아 `dist/sitemap-index.xml`과 `dist/sitemap-0.xml`을 만든다. 배포 주소는 다음과 같다.

```text
https://minimal1.github.io/blog/sitemap-index.xml
```

프로젝트, 공개 로그, 태그, 목록과 기존 `season1` 페이지를 포함한다. `draft: true` 로그는 현재 라우팅에서 페이지를 생성하지 않으므로 사이트맵에도 들어가지 않는다. 새 글의 경로를 사이트맵에 수동으로 추가하지 않는다. GitHub Pages 배포 과정에서 새 목록이 함께 반영된다.

글의 실질적인 수정일을 모든 페이지에서 알 수 없으므로 `lastmod`는 생성하지 않는다. 빌드한 날짜를 글의 수정일로 사용하지 않는다.

통합은 `3.7.4`로 고정한다. `3.7.5`의 전이 의존성 `sitemap@10`은 Node `22.22.1` 이상을 요구하므로 프로젝트에 선언된 Node `22.12.0` 지원 범위를 유지하기 위한 선택이다. Node 지원 범위를 갱신할 때 통합 버전도 함께 검토한다.

## 최초 등록과 확인

Google Search Console에서 `https://minimal1.github.io/blog/`를 URL 접두어 속성으로 등록하고 소유권을 확인한 뒤 위 사이트맵 주소를 제출한다. 같은 주소를 유지한다면 글마다 다시 제출하지 않는다. 색인 보고서와 URL 검사는 주기적으로 확인한다. 사이트맵 제출은 색인이나 검색 순위를 보장하지 않는다.

`robots.txt`는 `https://minimal1.github.io/robots.txt`에 있어야 한다. 이 프로젝트의 `public/robots.txt`는 `/blog/robots.txt`에 배포되므로 수집 규칙을 전달하지 못한다. 도메인 루트를 관리하는 사이트가 있다면 그쪽에서 `Sitemap: https://minimal1.github.io/blog/sitemap-index.xml`을 선언할 수 있다. 루트에 파일이 없어도 기본적으로 수집은 허용되며, Search Console에 직접 사이트맵을 제출할 수 있다.

## 검증

```sh
pnpm test:seo-sitemap
pnpm build
pnpm exec tsc --noEmit
git diff --check
```

테스트는 임시 프로젝트에 공개 로그와 초안 로그를 추가해 빌드한다. 사이트맵이 `/blog/` 아래의 모든 생성 페이지를 중복 없이 포함하고, 새 공개 로그를 자동 발견하며, 초안의 페이지와 URL은 생성하지 않는지 확인한다. 실제 콘텐츠 파일은 수정하지 않는다.

## 근거

- [Astro Sitemap 통합](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Astro Sitemap 변경 이력](https://github.com/withastro/astro/blob/main/packages/integrations/sitemap/CHANGELOG.md)
- [Google 사이트맵 안내](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google robots.txt 위치 규칙](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt#format_location)
