# 개발 기록의 구조화 데이터

공개된 개발 기록은 빌드할 때 `BlogPosting`과 `BreadcrumbList`를 JSON-LD로 생성한다. 새 글에 별도 SEO 필드를 추가할 필요는 없다.

- 글의 `title`, `description`, `publishedAt`과 연결된 프로젝트 이름을 사용한다.
- 작성자는 현재 블로그의 단일 작성자 `Minimal`이며 소개 페이지로 연결한다.
- 탐색 경로는 프로젝트 목록 → 프로젝트 소개 → 현재 기록이다.
- URL은 Astro의 `site`, 배포 경로와 실제 글 경로에서 생성한다. `/blog`와 끝의 `/`를 유지하고 쿼리와 프래그먼트는 제외한다.
- 실제 수정일과 대표 이미지 정보가 없으므로 `dateModified`와 `image`는 생성하지 않는다. 배포 날짜를 글의 수정일로 사용하지 않는다.
- `draft: true`인 글은 기존 공개 경로 생성 규칙에 따라 구조화 데이터도 배포하지 않는다.

JSON-LD는 본문의 `<script type="application/ld+json">`에 포함된다. 브라우저에서 실행하는 코드와 추가 요청은 없으며, 문자열의 `<`를 JSON 유니코드 이스케이프로 바꾸어 스크립트 종료 태그 삽입을 막는다.

## 검증

```sh
node --experimental-strip-types --test tests/seo-structured-data*.test.mjs
pnpm build
pnpm exec tsc --noEmit
git diff --check
```

빌드 테스트는 임시 프로젝트에 공개 글과 초안을 추가하여 JSON 파싱, `/blog` URL, 실제 발행일, 스크립트 종료 태그 처리와 초안 경로 제외를 확인한다. 원본 콘텐츠는 변경하지 않는다.

배포 후 Google Rich Results Test와 Search Console의 URL 검사로 Google이 수집한 결과도 확인할 수 있다. 구조화 데이터는 내용 이해를 돕지만 검색 결과의 특정 표시를 보장하지 않는다.

## 공식 문서

- [Google Article 구조화 데이터](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Breadcrumb 구조화 데이터](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Astro 컴포넌트](https://docs.astro.build/en/basics/astro-components/)
- [Astro set:html 지시자](https://docs.astro.build/en/reference/directives-reference/#sethtml)
