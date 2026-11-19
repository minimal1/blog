# main의 필수 상태 검사

`main`에 반영할 변경은 GitHub Actions의 `content`와 `lighthouse` 검사가 완료되어야 한다. 실제 병합 차단은 저장소의 활성 규칙으로 적용한다. 워크플로우와 규칙 JSON이 저장소에 있다는 사실만으로 보호가 활성화되지는 않는다.

| 검사 이름 | 워크플로우 | 확인하는 내용 |
| --- | --- | --- |
| `content` | Content checks | 빌드, 타입, 회귀 테스트, 콘텐츠 메타데이터와 초안 경로 |
| `lighthouse` | Mobile performance report | 모바일 측정 실행, 타입, 회귀 테스트. 성능 점수 임계값은 없음 |

두 검사 모두 모든 PR에서 실행한다. 파일 경로 필터나 조건부 미실행을 추가하면 필수 검사 결과가 생성되지 않아 PR이 계속 대기할 수 있다. 검사 이름을 바꾸면 규칙도 함께 갱신한다.

`build`와 `deploy`는 `main` 병합 후 실행되는 Pages 작업이므로 PR의 필수 검사에 넣지 않는다. GitHub Actions 앱에서 생성한 검사만 인정하도록 앱 ID `15368`을 지정한다.

## 소유자 또는 관리자가 한 번 적용하기

먼저 모든 PR에서 두 검사가 실행되는 변경을 `main`에 반영한다. 그다음 저장소의 규칙 편집 권한이 있는 계정으로 [Settings → Rules → Rulesets](https://github.com/minimal1/blog/settings/rules)에 접속한다.

**New ruleset → Import a ruleset**에서 [규칙 JSON](../.github/rulesets/main-required-checks.json)을 가져와 다음 설정을 확인하고 저장한다. UI에서 직접 같은 값으로 생성해도 된다.

- 이름: `main-required-ci`
- Enforcement status: `Active`
- 대상: `refs/heads/main`
- Bypass list: 비어 있음
- Require status checks to pass: `content`, `lighthouse`; 출처는 GitHub Actions
- Require branches to be up to date before merging: 선택

CI에 관한 요구만 추가한다. 리뷰 승인 수, 코드 소유자 승인과 병합 방식은 이 규칙에서 변경하지 않는다. 우회 목록이 비어 있으므로 관리자도 검사 실패를 우회하도록 지정하지 않는다.

관리자 계정으로 로그인한 GitHub CLI에서는 다음과 같이 같은 규칙을 생성할 수 있다. 중복 생성을 피하려면 기존 규칙 목록부터 확인한다.

```sh
gh api repos/minimal1/blog/rulesets
gh api --method POST repos/minimal1/blog/rulesets --input .github/rulesets/main-required-checks.json
gh api repos/minimal1/blog/rules/branches/main
```

설정은 `rules/branches/main`에 `required_status_checks`가 나타나고 두 검사 이름·GitHub Actions 앱·최신 브랜치 요구가 일치할 때 적용된 것으로 판단한다. 새 PR에서 두 검사가 필수로 표시되고 대기·실패 중에는 병합할 수 없는지도 확인한다. API가 권한 오류를 반환하면 소유자 또는 규칙 편집 권한이 있는 계정에서 적용해야 한다.

## 로컬 검증

```sh
node --test tests/required-checks.test.mjs
```

이 테스트는 규칙과 워크플로우의 이름·실행 조건이 일치하는지 확인한다. 원격 저장소에 규칙이 실제로 적용됐는지는 GitHub API와 PR 화면에서 별도로 확인한다.

## 공식 근거

- [GitHub ruleset 생성과 JSON 가져오기](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [필수 상태 검사와 최신 브랜치 요구](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-status-checks-to-pass-before-merging)
