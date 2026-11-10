# 콘텐츠 작성 가이드

이 문서는 이 블로그에 프로젝트와 개발 기록을 추가할 때 따르는 구조와 발행 기준이다. 새로운 세션에서 콘텐츠를 작성하는 사람이나 에이전트는 작업 전에 이 문서, [`WRITING_STYLE.md`](./WRITING_STYLE.md), 대상 프로젝트의 기존 글을 먼저 읽는다.

## 가장 중요한 원칙

1. 새 글은 `projects`와 `logs` 컬렉션에만 작성한다. `src/posts/season1/`은 이전 블로그 구조이므로 새 콘텐츠에 사용하지 않는다.
2. 초안은 반드시 `draft: true`로 시작한다. `draft`를 생략하면 기본값이 `false`라 공개 글로 빌드된다.
3. 콘텐츠 작업만 요청받았다면 컴포넌트, 스타일, 컬렉션 스키마를 함께 변경하지 않는다.
4. 사실 확인, 생각 정리, 문장 작성과 퇴고는 [`WRITING_STYLE.md`](./WRITING_STYLE.md)를 따른다. 이 문서에서 같은 규칙을 반복하지 않는다.

## 콘텐츠 구조

```text
src/content/
├── projects/
│   └── <project-id>.md
└── logs/
    └── <project-id>/
        ├── 01-<slug>.md
        └── 02-<slug>.md
```

- 프로젝트 파일 하나가 프로젝트 소개, 현재 상태, 이정표를 정의한다.
- 개발 기록은 프로젝트별 디렉터리에 모은다.
- `<project-id>`와 `<slug>`는 영문 소문자 kebab-case를 사용한다.
- 프로젝트 ID는 프로젝트 파일명에서 결정된다. 예: `quiet-metrics.md`의 ID는 `quiet-metrics`다.
- 로그 파일명은 프로젝트 안에서 `01`, `02`, `03`처럼 다음 미사용 두 자리 순번으로 시작한다. 공개한 기존 파일은 새 글을 끼워 넣기 위해 다시 번호를 매기지 않는다.
- 프로젝트 파일명이나 로그 파일명을 바꾸면 URL이 바뀐다. 공개 후에는 명확한 이유 없이 이름을 바꾸지 않는다.
- 컬렉션은 glob으로 파일을 자동 발견하고 페이지와 태그 경로도 자동 생성한다. 콘텐츠를 추가하기 위해 별도 목록이나 라우트 파일을 수정하지 않는다.

생성되는 주요 URL은 다음과 같다.

```text
/blog/projects/<project-id>/
/blog/projects/<project-id>/logs/<log-file-stem>/
/blog/tags/<tag>/
```

`<log-file-stem>`은 `.md`를 제외한 파일명이다. 예를 들어 `02-event-pipeline.md`의 글 경로는 `/logs/02-event-pipeline/`로 끝난다.

## 작업 순서

### 1. 콘텐츠 메타데이터를 확인한다

작업 전에 다음 정보를 확인한다.

- 대상 프로젝트 ID
- 새 프로젝트인지 기존 프로젝트의 로그인지
- 로그의 종류와 발행일
- 공개 글인지 초안인지
- 프로젝트 상태나 이정표도 함께 바뀌는지

글의 내용에 필요한 사실과 사고 메모는 `WRITING_STYLE.md`의 절차로 확인한다.

### 2. 기존 맥락을 읽는다

기존 프로젝트라면 다음 파일을 확인한다.

1. `src/content/projects/<project-id>.md`
2. 같은 프로젝트의 최근 로그 2~3개
3. `src/content.config.ts`
4. 태그를 고를 때 다른 프로젝트의 관련 로그

이 과정에서 프로젝트 ID, 파일 순번, 현재 메타데이터, 기존 태그와 명칭을 확인한다. 내용과 문체의 일관성은 `WRITING_STYLE.md`에 따라 검토한다.

### 3. 알맞은 콘텐츠 유형을 고른다

- 새 제품을 처음 소개한다: 프로젝트 파일을 만들고 첫 로그도 별도로 작성한다.
- 기존 제품의 진행 과정을 기록한다: 로그만 추가한다.
- 상태, 소개, 링크 또는 이정표가 달라졌다: 프로젝트 파일도 함께 갱신한다.

### 4. 초안으로 작성하고 검증한다

새 로그에는 먼저 `draft: true`를 명시한다. 내용과 로컬 미리보기를 확인한 뒤 공개 요청이 명확할 때만 `draft: false`로 바꾸거나 필드를 제거한다.

## 프로젝트 작성 규칙

위치: `src/content/projects/<project-id>.md`

### Frontmatter

| 필드 | 필수 | 허용 값과 규칙 |
| --- | --- | --- |
| `title` | 예 | 화면에 표시할 제품명 |
| `summary` | 예 | 프로젝트 카드와 소개 영역에 표시되는 요약문 |
| `status` | 예 | `building`, `testing`, `maintained` 중 하나 |
| `startedAt` | 예 | 실제 시작일, `YYYY-MM-DD` |
| `updatedAt` | 예 | 마지막으로 공개된 실질적 업데이트 날짜, `YYYY-MM-DD` |
| `order` | 예 | 프로젝트 표시 순서. 작은 숫자가 먼저 나오며 다른 프로젝트와 중복하지 않는다. |
| `links` | 아니요 | `website`, `repository`에 완전한 URL을 적는다. 없는 키나 빈 `links` 객체는 생략한다. |
| `milestones` | 예 | `label`과 `state`로 이루어진 이정표 목록 |

프로젝트 상태의 의미는 다음과 같다.

- `building`: 핵심 기능을 만들거나 제품 방향을 활발히 바꾸는 단계
- `testing`: 베타, 사용자 검증, 출시 전 안정화 단계
- `maintained`: 큰 기능 개발보다 운영과 품질 유지를 중심으로 하는 단계

이정표의 `state`는 다음 세 값만 사용한다.

- `done`: 완료됨
- `current`: 현재 진행 중
- `upcoming`: 다음에 진행할 예정

현재 레이아웃은 네 개의 이정표에 가장 잘 맞는다. 가능하면 완료된 단계부터 예정 단계까지 네 개로 요약하고, 일반적인 진행 상태에서는 `current`를 하나만 둔다. 실제 프로젝트 상태가 다르면 정확성을 우선한다.

### 본문

프로젝트 본문은 Frontmatter 뒤에 Markdown으로 작성한다. 페이지 제목은 레이아웃에서 자동 생성되므로 본문에 `# 제목`을 다시 쓰지 않는다. 다룰 내용과 문장 기준은 `WRITING_STYLE.md`를 따른다.

### 프로젝트 템플릿

```md
---
title: "프로젝트 이름"
summary: "프로젝트 요약"
status: "building"
startedAt: YYYY-MM-DD
updatedAt: YYYY-MM-DD
order: 4
links:
  website: "https://example.com"
  repository: "https://github.com/example/repository"
milestones:
  - label: "문제와 원칙 정의"
    state: "done"
  - label: "핵심 기능 구현"
    state: "current"
  - label: "비공개 베타"
    state: "upcoming"
  - label: "첫 공개 출시"
    state: "upcoming"
---
```

Frontmatter 다음에 `WRITING_STYLE.md`에 따라 프로젝트 본문을 작성한다. 사용하지 않는 `website` 또는 `repository` 행은 삭제한다. 두 링크가 모두 없다면 `links` 전체를 삭제한다.

## 개발 기록 작성 규칙

위치: `src/content/logs/<project-id>/<NN>-<slug>.md`

### Frontmatter

| 필드 | 필수 | 허용 값과 규칙 |
| --- | --- | --- |
| `title` | 예 | 목록과 글 상단에 표시되는 제목 |
| `description` | 예 | 목록, 글 상단과 메타 태그에 표시되는 설명문 |
| `publishedAt` | 예 | 실제 사건 또는 발행 날짜, `YYYY-MM-DD` |
| `project` | 예 | 프로젝트 파일명과 정확히 같은 ID |
| `kind` | 예 | `decision`, `build`, `launch`, `retrospective` 중 하나 |
| `tags` | 아니요 | 관련 태그 문자열 배열. 생략 시 빈 배열이지만 보통 2~4개를 사용한다. |
| `draft` | 아니요 | 기본값은 `false`. 작성 중에는 반드시 `true`로 명시한다. |

`kind`는 글의 중심에 따라 고른다.

- `decision`: 선택지, 제약, 트레이드오프와 결정 이유
- `build`: 구현 방식, 기술적 문제, 실패와 해결 과정
- `launch`: 출시 내용, 공개 범위, 초기 관찰 또는 실제 결과
- `retrospective`: 일정 기간이나 단계가 끝난 뒤의 평가와 배움

### 제목과 설명

제목과 설명의 작성 및 퇴고 기준은 `WRITING_STYLE.md`를 따른다.

### 본문 구성

본문의 사고 순서, 문장 작성과 퇴고는 `WRITING_STYLE.md`를 따른다. 페이지 제목은 자동 생성되므로 본문에서 `#` 제목을 사용하지 않는다. 소제목은 `##`부터 시작한다. Fenced code block에는 `ts`, `sh`, `text`처럼 언어를 지정한다.

### 태그

태그는 프로젝트 분류가 아니라 여러 프로젝트를 가로질러 반복되는 주제다.

- 먼저 기존 태그를 재사용한다.
- 표기만 다른 동의어를 새로 만들지 않는다. 예: `사용자 인터뷰`와 `사용자인터뷰`를 함께 쓰지 않는다.
- 너무 넓거나 글의 핵심이 아닌 태그는 붙이지 않는다.
- Frontmatter에는 `#` 없이 쓴다. 화면에서 `#`가 자동으로 붙는다.

기존 태그는 다음 명령으로 확인할 수 있다.

```sh
rg '^tags:' src/content/logs
```

### 개발 기록 템플릿

```md
---
title: "글 제목"
description: "글 설명"
publishedAt: YYYY-MM-DD
project: "project-id"
kind: "decision"
tags: ["제품전략", "의사결정"]
draft: true
---
```

Frontmatter 다음에 `WRITING_STYLE.md`에 따라 개발 기록 본문을 작성한다.

## 프로젝트 메타데이터 함께 갱신하기

새 로그를 공개할 때 대상 프로젝트 파일도 확인한다.

- `updatedAt`: 새 글이 최신 공개 업데이트라면 해당 날짜로 변경한다.
- `status`: 개발, 테스트, 운영 단계가 실제로 바뀌었을 때만 변경한다.
- `milestones`: 완료된 단계는 `done`, 현재 단계는 `current`, 이후 단계는 `upcoming`으로 조정한다.
- `summary`와 본문: 제품의 대상이나 범위가 달라졌을 때만 수정한다.
- `links`: 실제 공개된 URL만 추가한다.

미래 날짜의 초안 때문에 `updatedAt`, 상태 또는 이정표를 미리 바꾸지 않는다. 프로젝트 메타데이터는 공개 페이지의 현재 사실을 나타내야 한다.

## 공개와 정렬 동작

- 프로젝트는 `order` 오름차순으로 표시된다.
- 공개 로그는 `publishedAt` 내림차순으로 표시된다.
- 로그 파일의 숫자 접두사는 파일 관리와 서사 순서를 위한 것이며 화면 정렬에는 사용되지 않는다.
- `draft: true`인 로그는 홈, 모든 기록, 프로젝트 기록, 태그와 개별 글 경로에서 제외된다.
- 태그 페이지와 태그 개수는 공개 로그만 기준으로 자동 생성된다.
- 로그의 `project`가 존재하지 않거나 enum 값이 잘못되면 빌드가 실패한다.

## 검증 절차

콘텐츠를 작성한 뒤 저장소 루트에서 다음을 실행한다.

```sh
pnpm build
pnpm exec tsc --noEmit
git diff --check
```

로컬 화면을 확인할 때는 프로젝트 규칙에 따라 백그라운드 서버를 사용한다.

```sh
pnpm astro dev --background
```

주요 확인 경로:

```text
http://localhost:4321/blog/
http://localhost:4321/blog/projects/<project-id>/
http://localhost:4321/blog/projects/<project-id>/logs/<log-file-stem>/
http://localhost:4321/blog/tags/
```

초안은 공개 경로가 생성되지 않으므로 개별 글 화면을 확인하려면 잠시 `draft: false`로 미리 본 뒤 커밋 전 다시 `true`로 돌리거나, 공개 요청을 받은 뒤 검증한다.

## 최종 체크리스트

사실, 사고, 제목, 본문과 문장에 대한 검토는 `WRITING_STYLE.md`의 최종 체크리스트에서 수행한다.

### 구조와 메타데이터

- [ ] 경로와 파일명이 kebab-case 및 순번 규칙을 따른다.
- [ ] Frontmatter 값이 `src/content.config.ts`의 스키마와 일치한다.
- [ ] `project`가 실제 프로젝트 ID와 일치한다.
- [ ] 기존 태그를 우선 재사용했다.
- [ ] 초안이라면 `draft: true`를 명시했다.
- [ ] 공개 글이라면 프로젝트의 `updatedAt`, 상태와 이정표를 확인했다.

### 검증

- [ ] `pnpm build`가 성공한다.
- [ ] `pnpm exec tsc --noEmit`가 성공한다.
- [ ] `git diff --check`가 성공한다.
- [ ] 홈, 프로젝트, 글, 태그 페이지의 데스크톱과 모바일 표시를 확인했다.
- [ ] 사용자가 요청하지 않은 코드나 스타일 변경이 섞이지 않았다.
