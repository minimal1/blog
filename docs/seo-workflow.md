# 콘텐츠 SEO 작업 흐름

검색에 필요한 기술 설정은 빌드와 CI로 검증하고, 글의 의미와 사실은 근거를 대조해 검토한다. 계정 설정과 검색 성과 해석은 별도 운영 작업이다.

| 구분 | 작업 | 실행 시점과 결과 |
| --- | --- | --- |
| 자동 검사 | 콘텐츠 스키마·메타데이터, Markdown 제목 구조, 초안 페이지 제외, 빌드·타입·회귀 테스트 | 작성 중 로컬 명령과 PR의 `Content checks` CI. 실패 위치를 수정한다. |
| AI 판단 | 독자 질문, 제목·요약과 본문의 일치, 경험과 가정, 사실 출처, 관련 내부 링크, alt의 의미, 중복·최신성·불확실성 | 세 차례 퇴고 뒤 `content-seo-review` skill. 항목별 판정과 근거를 대화나 PR 본문에 남긴다. |
| 최초 계정 설정 | Search Console 속성 등록, 소유권 확인, 사이트맵 제출 | 사이트 소유자가 배포 후 한 번 수행한다. 계정·도메인이 바뀌면 다시 확인한다. |
| 정기 해석 | 색인 상태, 실제 검색 질문·노출·클릭·CTR, 모바일 성능과 글의 최신성 | 월 1회와 큰 변경 후에 확인한다. 비교 기간과 관찰의 한계를 남긴다. |

## 글 작성부터 발행까지

1. [`CONTENT_GUIDE.md`](../CONTENT_GUIDE.md)에 따라 대상 프로젝트와 기존 글을 읽고 새 로그를 `draft: true`로 작성한다.
2. [`WRITING_STYLE.md`](../WRITING_STYLE.md)의 사실 확인과 세 차례 퇴고를 수행한다.
3. [콘텐츠 SEO 검토 skill](../.agents/skills/content-seo-review/SKILL.md)을 실행한다. 독자와 예상 검색 질문 한 개를 적고, 모든 항목에 `pass`, `revise`, `needs-facts`, `N/A` 중 하나와 `파일:줄` 근거를 남긴다.
4. 편집 문제를 수정한다. 핵심 사실이 없으면 사용자에게 확인하고 새 발행을 보류한다. 검색 친화적인 표현을 만들기 위해 수치·경험·확신을 보태지 않는다.
5. 아래 로컬 검사를 수행한다. PR에서는 같은 검사를 CI로 다시 수행한다.
6. 검토 결과와 실행 결과를 대화나 작성 권한이 있는 PR 본문에 남긴다. 명확한 공개 요청을 받은 뒤에만 새 로그의 발행 상태를 바꾼다. 바꾼 상태로 검사하고 프로젝트의 공개 메타데이터도 확인한다.

검토표를 콘텐츠 파일에 넣거나 내부 추론 과정을 공개할 필요는 없다. 이 저장소에는 특정 AI 실행 환경에 종속된 hook을 설치하지 않는다. `AGENTS.md`에서 필수 검토 단계로 연결하며, 실제 AI 검토 실행과 품질은 에이전트의 지시 준수와 사용자 확인에 의존한다.

## 로컬 명령과 CI

저장소 루트에서 실행한다.

```sh
pnpm install --frozen-lockfile
pnpm check:content
pnpm build
pnpm exec tsc --noEmit
node --experimental-strip-types --test --test-concurrency=1 tests/*.test.mjs
pnpm check:content --built
git diff --check
```

검사 코드만 빠르게 확인하려면 `pnpm test:content`를 실행한다. `.github/workflows/content-check.yaml`은 PR과 `main` push에서 빌드, 타입 검사, 저장소의 `tests/*.test.mjs`, 빌드 후 콘텐츠 검사를 실행한다. 저장소 관리자가 필수 상태 검사로 지정해야 CI 실패가 병합을 막는다. 이 문서와 CI 파일 추가만으로 GitHub의 브랜치 규칙이 바뀌지는 않는다.

`pnpm check:content`는 `src/content/projects/`와 `src/content/logs/`의 `.md`·`.mdx` 파일을 대상으로 다음을 검사한다.

- YAML Frontmatter의 매핑 형식과 중복 키
- 공백이 아닌 `title`, 프로젝트 `summary`, 로그 `description`
- 공개 항목 사이의 제목·요약 중복. NFC 정규화, 연속 공백 정리와 소문자 변환 후 정확히 같은 값만 찾는다. 프로젝트의 `summary`와 로그의 `description`도 서로 비교한다. 초안의 작업용 메타데이터는 중복 비교에서 제외한다.
- 로그의 `draft`가 주어진 경우 불리언인지 여부. 생략하면 공개되는 기존 기본값은 유지하므로, 새 로그의 초안 시작과 공개 요청은 AI 검토에서 반드시 확인한다.
- `.md` 본문에 레이아웃의 제목과 겹치는 H1이 있는지 여부. 코드블록은 제목으로 해석하지 않는다.

YAML은 `yaml`, Markdown은 `mdast-util-from-markdown`으로 파싱한다. 링크나 이미지 설명의 의미를 정규식으로 판정하지 않는다. `.mdx`의 메타데이터는 검사하지만 본문 H1 자동 검사는 제외한다. 현재 저장소에 MDX 통합이 없으며 일반 Markdown 파서는 JavaScript 문자열과 실제 제목을 구분하지 못하기 때문이다. MDX 본문 전체와 HTML·MDX 컴포넌트 안의 제목·alt는 MDX 통합 후 실제 렌더링과 AI 검토로 확인한다. 이전 글인 `src/posts/season1/`에는 이 작성 규칙을 소급 적용하지 않는다.

`pnpm check:content --built`는 같은 검사에 더해 현재 라우트 규칙에 따른 초안의 개별 HTML이 `dist/`에 생성됐는지 확인한다. 반드시 새 `pnpm build` 뒤에 실행한다. 홈·목록·태그의 내용이나 외부 검색 엔진의 색인 상태까지 증명하는 검사는 아니다. 출력 디렉터리나 로그 경로를 바꾸면 검사와 테스트도 함께 갱신한다.

CI 통과는 사실성, 출처의 충분성, 검색 순위, 검토표의 품질 또는 발행 승인을 뜻하지 않는다. 강제 글자 수·키워드 빈도·SEO 점수는 사용하지 않는다.

## Search Console 최초 설정

이 단계는 계정에 로그인한 사이트 소유자가 수행한다. 현재 사이트는 `https://minimal1.github.io/blog/`를 사용한다. 계정 등록·소유권 확인·사이트맵 제출을 코드 변경만으로 완료했다고 보고하지 않는다.

1. [Search Console](https://search.google.com/search-console)에 로그인해 **URL 접두어** 속성 `https://minimal1.github.io/blog/`를 추가한다. `github.io`의 DNS를 소유하지 않는 GitHub Pages 프로젝트이므로 이 경로를 정확히 지정한다.
2. [소유권 확인 안내](https://support.google.com/webmasters/answer/9008080)에 따라 제공된 방법 중 사이트에 적용 가능한 방법을 고른다. HTML 태그 방식이라면 제공받은 실제 확인 값을 적용하고 배포한 뒤 확인한다. 확인 값은 임의로 만들지 않으며 유지해야 한다. HTML 파일 방식은 안내된 정확한 URL에 접근할 수 있는지 먼저 확인한다.
3. 사이트맵 변경을 배포한 뒤 `https://minimal1.github.io/blog/sitemap-index.xml`이 공개로 열리는지 확인한다. 세부 생성·제외 규칙은 [사이트맵 문서](./seo-sitemap.md)를 따른다.
4. Search Console의 **Sitemaps**에서 해당 사이트맵 URL을 제출하고 처리 상태를 확인한다. 필요한 공개 글만 URL 검사로 확인한다. 사이트맵 제출이나 색인 요청이 실제 색인·노출을 보장하지는 않는다.

사이트 소유권·속성이나 배포 주소가 바뀌면 위 URL과 관련 설정을 다시 확인한다. robots.txt의 허용 여부만으로 기존 색인 제거를 판단하지 않는다.

## 정기 확인

- **색인:** 의도한 공개 URL이 색인 가능한지 확인한다. 제외 사유, canonical과 사이트맵 상태를 함께 읽고 오류가 있는 파일을 특정한다.
- **검색 질문:** 실제 유입 질문이 글의 내용과 맞는지 본다. 기간, 페이지, 노출 수를 함께 기록하고 표본이 적은 CTR 변화에서 원인을 단정하지 않는다.
- **메타데이터:** 제목·요약을 바꿀 때는 본문 근거와 실제 검색 질문을 함께 확인한다. [메타데이터 문서](./seo-metadata.md)와 [구조화 데이터 문서](./seo-structured-data.md)를 참고한다.
- **성능과 최신성:** [성능 문서](./seo-performance.md)의 검사를 참고하고, 브라우저 측정과 실제 사용자 데이터를 구분한다. 프로젝트 상태·날짜·버전이 달라졌는지도 확인한다.

기존 글 수정이 필요하면 해당 글의 작성 흐름으로 돌아가 근거와 변경 이유를 남긴다. 조회수가 낮다는 이유만으로 경험이나 결과를 확대해 쓰지 않는다.
