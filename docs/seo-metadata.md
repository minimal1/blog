# 페이지 메타정보 자동화

공통 레이아웃은 모든 페이지에 대표 URL, Open Graph와 Twitter 카드 정보를 생성한다. 대표 URL은 `astro.config.mjs`의 `site`와 현재 경로에서 만들며 `/blog` 경로와 끝 슬래시를 유지하고 쿼리와 해시를 제외한다. 개발 서버에서도 공개 사이트 주소를 사용한다.

개발 기록의 `title`과 `description`, 프로젝트의 `title`과 `summary`는 기존 라우트에서 전달한다. 새 글을 추가하면 이 정보가 검색용 제목·설명과 공유 메타정보에 함께 반영된다. 목록과 태그 페이지는 각 페이지의 내용을 설명하는 요약을 전달한다. 이전 `season1` 글도 원래 제목과 설명을 전달한다.

모든 페이지는 블로그 이름이 표시된 기본 공유 이미지 `public/social-preview.png`를 사용한다. 각 글의 스크린샷이나 결과물을 나타내는 이미지는 아니다. 이미지 URL은 `/blog`를 포함한 절대 주소이며 크기와 대체 텍스트도 함께 제공한다. 새 글은 별도 이미지 작업 없이 기본값을 상속한다. 글별 이미지가 필요해지면 콘텐츠에 실제 대표 이미지와 대체 텍스트를 추가한 뒤 레이아웃에서 기본값 대신 연결할 수 있다.

이미지를 바꾸려면 `public/social-preview.svg`를 편집하고 기존 `sharp` 의존성으로 PNG를 다시 생성한다. 두 파일을 함께 커밋한다.

```sh
node --input-type=module -e 'import sharp from "sharp"; await sharp("public/social-preview.svg").png().toFile("public/social-preview.png");'
```

`rel="sitemap"`은 `/blog/sitemap-index.xml`을 가리킨다. 해당 파일은 별도의 사이트맵 자동 생성 변경이 제공한다. 같은 주소를 계속 사용하므로 새 글을 쓸 때 발견 링크를 수정하지 않는다.

기존 `season1` 두 글에는 동일한 설명이 저장되어 있다. 이 변경은 콘텐츠의 사실이나 발행 상태를 바꾸지 않고 원래 설명을 출력한다. 제목과 설명이 내용을 정확히 나타내는지 확인하는 일은 콘텐츠 검토 단계에서 수행한다.

## 검증

```sh
pnpm build
node --experimental-strip-types --test tests/seo-metadata.test.mjs
pnpm exec tsc --noEmit
git diff --check
```

회귀검사는 모든 빌드 페이지의 대표 URL과 공유 정보, 한글 태그의 인코딩, 글과 목록의 타입, 이전 글의 제목, 페이지별 설명을 확인한다. URL 함수 검사는 개발 서버 주소와 추적 파라미터가 대표 URL에 남지 않는지 확인한다.

## 근거

- [Astro의 URL·site API](https://docs.astro.build/en/reference/api-reference/#url)
- [Astro의 사이트맵 발견 링크](https://docs.astro.build/en/guides/integrations-guide/sitemap/#sitemap-discovery)
- [Google의 대표 URL 안내](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Open Graph 기본 속성](https://ogp.me/)
