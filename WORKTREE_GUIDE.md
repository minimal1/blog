# 병렬 콘텐츠 작업을 위한 Worktree 가이드

이 문서는 여러 프로젝트의 콘텐츠를 동시에 작성할 때 브랜치, Git worktree와 작업 세션을 분리하는 기준이다.

핵심 원칙은 다음과 같다.

> 프로젝트 1개 = 작업 브랜치 1개 = worktree 1개 = 작업 세션 1개

한 브랜치에서도 여러 프로젝트를 작성할 수는 있다. 그러나 문맥, 검토 범위와 커밋이 섞인다. Worktree는 프로젝트마다 독립된 디렉터리와 브랜치를 제공한다. 여러 세션이 동시에 작업해도 서로의 미완성 파일을 건드리지 않는다.

## 문서의 책임

- `CONTENT_GUIDE.md`: 파일 경로, Frontmatter, 초안, 발행과 검증
- `WRITING_STYLE.md`: 사실 확인, 사고, 문장 작성과 퇴고
- `WORKTREE_GUIDE.md`: 병렬 브랜치, 작업 디렉터리, 통합과 정리

세 문서의 규칙을 함께 적용한다. 이 문서는 콘텐츠 형식이나 문체 규칙을 반복하지 않는다.

## 저장소와 디렉터리 규칙

기본 저장소는 통합 전용 worktree로 사용한다. 프로젝트 worktree는 기본 저장소 안의 Git 비추적 디렉터리인 `.worktrees/` 아래에 모은다.

```text
~/Documents/personal-blog/blog/
├── .worktrees/
│   ├── <project-a>/         # 프로젝트 A 작업
│   └── <project-b>/         # 프로젝트 B 작업
└── ...                      # main, 통합과 최종 검증
```

- 기본 저장소 `blog/`에서는 `main`을 유지한다.
- 프로젝트 worktree는 `.worktrees/<project-id>`에 만든다.
- `.worktrees/`는 `.gitignore`에 등록하며 콘텐츠 커밋에 포함하지 않는다.
- worktree 내부에서 실행할 명령은 반드시 해당 worktree를 현재 디렉터리로 삼는다.
- 같은 프로젝트에서 동시에 두 글을 쓰지 않는다. 필요하면 먼저 한 글의 작업 범위와 담당 세션을 끝낸다.
- 하나의 worktree를 두 세션이 동시에 편집하지 않는다.

이 배치는 모든 프로젝트 작업 공간을 한곳에서 찾고 정리하기 쉽다. 반면 기본 저장소 안에 중첩된 디렉터리이므로 `.worktrees/`를 일반 폴더처럼 직접 삭제하거나 `git clean -fdx`의 대상으로 삼아서는 안 된다. 생성과 제거에는 항상 `git worktree` 명령을 사용한다.

## 브랜치 규칙

브랜치는 하나의 검토·발행 단위만 담는다.

```text
content/<project-id>/<topic>
```

예시:

```text
content/sample-project/first-launch
content/sample-project/pricing-decision
content/another-project/beta-retrospective
```

- `<project-id>`와 `<topic>`은 영문 소문자 kebab-case를 사용한다.
- 프로젝트 전체 수명 동안 하나의 장기 브랜치를 유지하지 않는다.
- 프로젝트 소개와 첫 로그처럼 함께 검토해야 하는 콘텐츠는 한 브랜치에 둘 수 있다.
- 서로 독립적으로 발행할 수 있는 로그는 별도 브랜치로 나눈다.
- 콘텐츠 브랜치에 사이트 컴포넌트, 전역 스타일, 컬렉션 스키마 변경을 섞지 않는다.

공유 코드나 구조 변경이 필요하면 콘텐츠 작업을 멈추고 별도 브랜치에서 먼저 처리한다.

```text
chore/<topic>
fix/<topic>
```

공유 변경을 `main`에 통합한 뒤 프로젝트 worktree에서 새 기준을 반영한다.

## 시작 전 조건

Worktree는 커밋된 기준점에서 만들어진다. 기본 저장소에 커밋하지 않은 변경이 있으면 새 worktree에 포함되지 않는다.

다음 조건을 모두 만족한 뒤 시작한다.

- 기본 저장소가 `main`에 있다.
- `git status --short` 결과가 비어 있다.
- 로컬 `main`이 `origin/main`과 동기화되어 있다.
- 사용할 프로젝트 ID와 브랜치 주제가 정해져 있다.
- 다른 worktree가 같은 프로젝트를 담당하지 않는다.

현재 상태는 다음 명령으로 확인한다.

```sh
cd ~/Documents/personal-blog/blog
git status --short --branch
git worktree list
git fetch origin
git pull --ff-only
```

기본 저장소가 깨끗하지 않다면 기존 변경을 먼저 검토하고 커밋하거나 별도 브랜치로 옮긴다. 임의로 삭제하거나 stash에 숨긴 뒤 진행하지 않는다.

## 새 프로젝트 작업 시작하기

아래 예시는 프로젝트 ID가 `sample-project`, 작업 주제가 `first-launch`인 경우다.

기본 저장소에서 실행한다.

```sh
cd ~/Documents/personal-blog/blog
git fetch origin
git pull --ff-only
git worktree add \
  -b content/sample-project/first-launch \
  .worktrees/sample-project \
  origin/main
```

새 worktree에는 `node_modules`가 없으므로 의존성을 설치한다. pnpm의 전역 저장소를 재사용하므로 패키지 전체가 매번 중복 저장되지는 않는다.

```sh
cd ~/Documents/personal-blog/blog/.worktrees/sample-project
pnpm install
```

생성 직후 다음 항목을 확인한다.

```sh
git status --short --branch
git rev-parse --show-toplevel
```

출력된 브랜치와 경로가 작업 지시의 브랜치·worktree와 같아야 한다.

## 기존 작업을 새 세션에서 이어가기

이미 worktree가 남아 있다면 새로 만들지 않는다.

```sh
cd ~/Documents/personal-blog/blog
git worktree list
git -C .worktrees/sample-project status --short --branch
```

해당 디렉터리와 브랜치를 새 세션에 그대로 전달한다.

로컬 worktree는 없고 원격 브랜치만 남아 있다면 다음처럼 복구한다.

```sh
cd ~/Documents/personal-blog/blog
git fetch origin
git worktree add \
  --track \
  -b content/sample-project/first-launch \
  .worktrees/sample-project \
  origin/content/sample-project/first-launch
cd .worktrees/sample-project
pnpm install
```

같은 브랜치를 둘 이상의 worktree에서 체크아웃하려 하지 않는다. Git이 막더라도 `--force`로 우회하지 않는다.

## 세션의 작업 범위

프로젝트 worktree의 세션은 원칙적으로 다음 경로만 편집한다.

```text
src/content/projects/<project-id>.md
src/content/logs/<project-id>/*.md
```

다음 파일은 공유 영역이다. 프로젝트 세션에서 바로 수정하지 않는다.

```text
src/content.config.ts
src/components/
src/layouts/
src/pages/
src/styles/
AGENTS.md
CONTENT_GUIDE.md
WRITING_STYLE.md
WORKTREE_GUIDE.md
```

공유 영역의 변경이 반드시 필요하면 작업을 중지하고 기본 저장소에서 별도 작업으로 분리한다. 프로젝트 브랜치에 우연히 포함된 공유 변경은 통합 전에 제거한다.

## 로컬 미리보기 포트

기본 저장소는 `4321`을 사용한다. 프로젝트 worktree에는 서로 다른 포트를 배정한다.

```text
blog/                 4321
첫 번째 worktree      4322
두 번째 worktree      4323
세 번째 worktree      4324
```

각 worktree에서 백그라운드 서버를 시작한다.

```sh
pnpm astro dev --background --port 4322
```

서버 명령은 해당 worktree 디렉터리에서 실행한다.

```sh
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

- 두 worktree에 같은 포트를 배정하지 않는다.
- `--ignore-lock`으로 기존 서버를 우회하지 않는다.
- 세션을 끝낼 때 더 이상 필요 없는 서버는 해당 worktree에서 중지한다.

## 작업 중 커밋과 원격 백업

커밋 하나에는 하나의 논리적 콘텐츠 변경만 담는다.

예시:

```text
docs: sample-project 프로젝트 소개 추가
docs: sample-project 첫 출시 기록 작성
docs: sample-project 베타 회고 수정
```

커밋 전에는 작업 범위를 확인한다.

```sh
git status --short
git diff -- src/content/projects/sample-project.md \
  src/content/logs/sample-project
```

필요한 파일만 명시해 스테이징한다.

```sh
git add src/content/projects/sample-project.md \
  src/content/logs/sample-project
git diff --cached --check
git diff --cached
git commit -m "docs: sample-project 첫 출시 기록 작성"
```

다른 세션이나 기기에서 이어가야 하거나 중간 백업이 필요하면 콘텐츠 브랜치를 푸시한다.

```sh
git push -u origin content/sample-project/first-launch
```

프로젝트 브랜치를 푸시하는 것은 발행이 아니다. 실제 사이트 배포 기준은 `main`이다.

## 프로젝트 브랜치 완료 조건

통합을 요청하기 전에 프로젝트 worktree에서 다음을 수행한다.

```sh
pnpm build
pnpm exec tsc --noEmit
git diff --check
git status --short --branch
```

다음 항목도 확인한다.

- `CONTENT_GUIDE.md`의 구조·발행 체크리스트를 통과했다.
- `WRITING_STYLE.md`의 퇴고 체크리스트를 통과했다.
- 변경 파일이 해당 프로젝트 경로에만 있다.
- 초안과 공개 상태가 의도와 일치한다.
- 커밋하지 않은 변경이 없다.
- 필요한 커밋이 원격 콘텐츠 브랜치에 푸시되어 있다.

## main에 통합하기

통합은 기본 저장소에서 한 프로젝트씩 순서대로 진행한다. 동시에 여러 브랜치를 `main`에 병합하지 않는다.

### 1. 기본 저장소를 갱신한다

```sh
cd ~/Documents/personal-blog/blog
git status --short --branch
git fetch origin
git pull --ff-only
```

작업 트리가 깨끗하지 않으면 병합하지 않는다.

### 2. 커밋 전 병합 상태에서 검증한다

```sh
git merge --no-commit --no-ff content/sample-project/first-launch
pnpm build
pnpm exec tsc --noEmit
git diff --cached --check
```

이 단계에서는 여러 프로젝트가 합쳐진 최종 상태를 확인한다.

- 프로젝트 `order`가 중복되지 않는가?
- 태그 표기가 기존 태그와 일치하는가?
- 같은 URL 또는 파일명이 생기지 않았는가?
- 홈, 프로젝트, 로그와 태그 페이지가 정상인가?
- 다른 프로젝트의 내용이나 메타데이터를 덮어쓰지 않았는가?

검증에 실패하면 커밋하지 않는다.

```sh
git merge --abort
```

문제를 프로젝트 worktree에서 수정하고 다시 통합한다.

### 3. 병합 커밋을 만들고 푸시한다

```sh
git commit -m "merge: sample-project 콘텐츠 통합"
git push origin main
```

한 프로젝트의 통합과 푸시가 끝난 뒤 다음 프로젝트를 통합한다. 이렇게 하면 실패한 프로젝트만 되돌리거나 수정할 수 있다.

## 충돌 처리

병합 충돌이 발생하면 기본 저장소에서 즉석으로 내용을 섞지 않는다.

```sh
git merge --abort
```

프로젝트 worktree에서 최신 `main`을 병합한다.

```sh
cd ~/Documents/personal-blog/blog/.worktrees/sample-project
git fetch origin
git merge origin/main
```

프로젝트 문맥을 가진 세션에서 충돌을 해결하고 전체 검증을 다시 수행한다. 해결 커밋을 콘텐츠 브랜치에 푸시한 뒤 기본 저장소에서 통합을 다시 시도한다.

충돌을 피하려고 다음 행동을 하지 않는다.

- 다른 프로젝트의 콘텐츠 파일을 복사해 덮어쓰기
- `git reset --hard`로 변경 삭제
- `git checkout --`로 사용자 변경 폐기
- 강제 푸시
- 여러 worktree 사이에서 stash 공유

## 통합 후 worktree 정리

`main` 푸시가 끝난 뒤에만 프로젝트 worktree를 제거한다.

먼저 안전 조건을 확인한다.

```sh
git -C .worktrees/sample-project status --short
git branch --merged main
```

worktree가 깨끗하고 콘텐츠 브랜치가 `main`에 병합된 것이 확인되면 정리한다.

```sh
pnpm --dir .worktrees/sample-project astro dev stop
git worktree remove .worktrees/sample-project
git branch -d content/sample-project/first-launch
git push origin --delete content/sample-project/first-launch
git worktree prune
```

- `git worktree remove` 대신 `.worktrees/` 안의 디렉터리를 직접 삭제하지 않는다.
- `.worktrees/`를 대상으로 `rm -rf`나 `git clean -fdx`를 실행하지 않는다.
- 커밋하지 않은 변경이 있으면 worktree를 제거하지 않는다.
- 병합되지 않은 브랜치를 `-D`로 강제 삭제하지 않는다.
- 원격 브랜치 삭제는 `main` 푸시를 확인한 뒤 수행한다.

## 새 세션에 전달할 작업 지시 템플릿

새 세션에는 저장소 이름만 말하지 말고 worktree와 브랜치를 명시한다.

```text
작업 위치: ~/Documents/personal-blog/blog/.worktrees/<project-id>
브랜치: content/<project-id>/<topic>
프로젝트 ID: <project-id>
미리보기 포트: <port>

먼저 AGENTS.md, CONTENT_GUIDE.md, WRITING_STYLE.md,
WORKTREE_GUIDE.md와 해당 프로젝트의 기존 콘텐츠를 읽으세요.

이 세션은 <project-id>의 콘텐츠만 담당합니다.
다른 프로젝트와 공유 코드·스타일·스키마는 수정하지 마세요.
초안과 발행 상태는 CONTENT_GUIDE.md를 따르세요.
문장 작성과 퇴고는 WRITING_STYLE.md를 따르세요.
main 병합과 worktree 삭제는 수행하지 마세요.
```

세션을 마칠 때는 다음 정보를 남긴다.

- worktree 절대 경로
- 브랜치 이름
- 마지막 커밋 해시
- 원격 푸시 여부
- 초안 또는 공개 상태
- 실행한 검증과 결과
- 아직 확인할 사실 또는 남은 작업

## 운영 체크리스트

### 시작

- [ ] 기본 저장소의 `main`이 깨끗하고 최신이다.
- [ ] worktree와 브랜치 이름이 프로젝트·주제를 나타낸다.
- [ ] 같은 프로젝트를 담당하는 다른 세션이 없다.
- [ ] 고유한 미리보기 포트를 배정했다.

### 작업

- [ ] 프로젝트 콘텐츠 경로만 수정했다.
- [ ] 공유 영역 변경은 별도 작업으로 분리했다.
- [ ] 콘텐츠와 문체 가이드를 따랐다.
- [ ] 중간 작업을 커밋하고 필요하면 원격 브랜치에 백업했다.

### 통합

- [ ] 프로젝트 worktree의 작업 트리가 깨끗하다.
- [ ] 빌드, 타입 검사와 diff 검사를 통과했다.
- [ ] `main`에서 한 프로젝트만 병합했다.
- [ ] 통합 상태의 전체 사이트를 다시 검증했다.
- [ ] `main` 푸시 후에만 worktree와 브랜치를 정리했다.
