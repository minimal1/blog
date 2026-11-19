# 모바일 성능 측정

`pnpm performance`는 사이트를 새로 빌드한 뒤 Lighthouse CI로 세 경로를 각각 세 번 측정한다. 처음에는 점수 예산을 두지 않고 기준값을 모은다. 빌드 실패, 브라우저 실행 실패, 측정 오류, 결과 누락은 명령과 CI를 실패시킨다.

## 로컬 실행

성능 도구는 Node.js 22.19 이상과 Chrome이 필요하다. 일반 블로그 빌드의 Node.js 요구사항은 기존 `>=22.12.0`을 유지한다. 측정에는 CI와 같은 Node.js 24.22.3, pnpm 12.11.2를 권장한다.

```sh
pnpm install --frozen-lockfile
pnpm performance
```

Chrome을 자동으로 찾지 못하면 실행 파일을 지정한다. macOS의 예시는 다음과 같다.

```sh
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm performance
```

측정 중에는 `127.0.0.1:4325`를 사용한다. 이미 사용 중이면 실패한다. Lighthouse CI가 Astro preview를 시작하고 측정 후 중지하므로 서버를 별도로 열 필요는 없다. Chrome은 측정마다 임시 프로필을 새로 만들고 종료할 때 정리한다.

## 측정 대상과 결과

대상은 `dist/`에서 고른다.

- 홈 `/blog/`
- 최신 공개 글이 속한 프로젝트
- 렌더링된 `<time datetime>`이 가장 최신인 공개 글. 날짜가 같으면 경로 내림차순으로 고른다.

글 슬러그를 설정에 고정하지 않는다. 초안은 Astro 빌드가 개별 HTML을 생성하지 않으므로 대상에 들어가지 않는다. 공개 글이 하나도 없거나 필요한 페이지가 빠지면 실패한다. 이 세 경로는 전체 사이트의 표본이다.

모바일 에뮬레이션과 Lighthouse 기본 simulated throttling을 사용한다. 각 실행의 설정, HTML·JSON 보고서, `manifest.json`, `summary.md`를 `reports/performance/run-*/`에 저장한다. 요약 표의 성능 점수·LCP·CLS·TBT는 지표별 세 번의 중앙값이다. LHCI가 표시하는 대표 실행의 모든 값과 같을 필요는 없다.

`@lhci/cli@0.16.1`을 `pnpm dlx`로 실행하며, 이 버전은 Lighthouse 13.6.0을 사용한다. 사이트 의존성에 LHCI를 추가하지 않는다. dlx의 하위 의존성 전체는 프로젝트 lockfile에 잠기지 않는다. 비교할 때 실행 설정과 보고서의 Node·Lighthouse 버전, 브라우저 user agent도 확인한다. 로컬 Chrome의 세부 버전은 실행 파일의 `--version` 출력으로 별도 확인한다.

`.lighthouseci/`는 다음 측정 때 교체되는 원시 결과 작업 공간이다. `reports/performance/`에는 실행별 결과가 쌓인다. 두 경로는 Git에서 제외한다. LHCI의 저장 대상은 `filesystem`으로 고정하며 외부 Lighthouse 보고서 서비스로 전송하지 않는다.

## PR에서 확인하기

`Mobile performance report` 워크플로는 사이트·콘텐츠·측정 설정에 영향을 주는 PR과 수동 실행에서 동작한다. 같은 `pnpm performance`로 빌드와 측정을 마친 뒤 타입 검사와 테스트를 실행한다. 빌드가 Astro 컬렉션 타입과 HTML 검사 대상을 먼저 생성한다. Actions와 Node·pnpm·Chrome·LHCI 버전을 고정한다. CI Chrome은 158.0.8127.36이다.

워크플로 요약에서 중앙값을 보고, 같은 실행의 `mobile-lighthouse-*` 아티팩트에서 세부 보고서를 내려받는다. 보고서는 이 저장소의 Actions 아티팩트로 14일간 보관한다. 실패한 수집의 원시 결과도 가능한 범위에서 보관한다. 워크플로 권한은 `contents: read`이며 PR 댓글이나 배포를 생성하지 않는다.

점수 제한은 기준값과 실행 간 변동을 확인한 뒤 별도 변경으로 정한다. 현재의 통과는 측정 절차의 성공을 뜻하며 성능 목표 달성을 뜻하지 않는다.

## 해석의 범위

여기서 LCP·CLS·TBT는 로컬 정적 사이트를 제한된 조건에서 연 실험실 측정값이다. GitHub Pages의 실제 네트워크·캐시·CDN 지연은 포함하지 않는다. 호스트의 CPU 부하와 브라우저 버전도 결과에 영향을 준다.

일반 Lighthouse 페이지 로드는 사용자 입력이 없어 INP를 측정하지 않는다. TBT는 입력 지연 가능성을 찾는 데 도움이 되지만 실제 사용자 INP와 같지 않다. Core Web Vitals의 현장 평가는 LCP·INP·CLS의 실제 사용자 데이터가 필요하다. Search Console·CrUX·PageSpeed Insights의 현장 데이터를 별도로 확인해야 하며, 데이터가 부족한 사이트는 현장 결과가 없을 수 있다.

## 공식 자료

- [Lighthouse CI 설정: 수집·filesystem 보고서](https://github.com/GoogleChrome/lighthouse-ci/blob/v0.16.1/docs/configuration.md)
- [Lighthouse 성능 점수와 변동](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [Web Vitals의 실험실·현장 측정과 INP](https://web.dev/articles/vitals)
- [Chrome Launcher의 임시 프로필](https://github.com/GoogleChrome/chrome-launcher#api)
