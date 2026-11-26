---
title: "Storybook을 만들어 놓고도 시안을 찾지 못했다"
description: "통곡의 벽에 Spec Studio를 적용하니 시안이 있는 것과 검토자가 필요한 화면을 찾아 판단할 수 있는 것 사이에 차이가 있었다."
publishedAt: 2026-11-26T17:42:20+09:00
project: "spec-studio"
kind: "build"
tags: ["Storybook", "디자인시스템"]
draft: false
---

Spec Studio를 [통곡의 벽](/blog/projects/wailing-wall/)에 적용할 때, 첫 시안을 제출받고 다시 Storybook은 어디서 볼 수 있느냐고 물었다. 이미 가상 데이터로 동작하는 조합 화면과 입력 예시는 만들어져 있었다. 그런데 Aru의 Spec Studio 탐색기에는 시안의 경로나 Story ID가 표시될 뿐이었다. 실제 화면을 조작해 보려면 별도로 띄운 Storybook을 열어야 했다.

Storybook을 열고 나서도 질문이 남았다. 조합 화면에서 카드나 타임라인을 볼 수는 있었다. 내가 그때 검토하고 싶었던 건 이번에 공용으로 만들 요소의 범위와 각각을 어떻게 쓸지였다. 완성된 조합 하나만 보고는 지금 배치가 이 화면의 선택인지, 다음 화면에도 따라야 할 기준인지 구별하기 어려웠다.

그래서 조합 화면을 남겨두고, Storybook 메뉴에서 설계 원칙과 요소별 예시를 따로 찾을 수 있게 했다. 먼저 원칙을 읽고, 버튼이나 대화상자로 이동해 상태를 조작하고, 다시 가이드로 돌아올 수 있었다. 공용 요소 코드는 그대로였지만 검토할 자료가 늘었으므로 새 버전으로 다시 검토했다. [통곡의 벽의 디자인 기록](/blog/projects/wailing-wall/logs/04-design-system-in-storybook/)에는 그때 정한 색과 요소의 역할을 따로 적어 두었다.

다음 변경에서는 이 공용 요소를 가져다 [페이지 배치와 폼 패턴](/blog/projects/wailing-wall/logs/05-product-ui-patterns/)을 만들고 검증했다. Storybook에서 같은 코드를 조작해 보고, 검토를 마친 패턴을 다음 화면의 재료로 삼을 수 있었다. 여기까지는 가상 데이터를 쓴 공용 UI 검증이었다. 실제 제품의 저장이나 권한을 확인한 것은 아니었다.

두 가지 중 요소를 찾는 문제는 Storybook 안에서 풀었다. 시안이 어디 있는지 알려주는 문제는 남았다. [읽기 전용 탐색기](/blog/projects/spec-studio/logs/05-aru-as-an-artifact-browser/)에서 참조를 본 사람에게, 어느 Story를 열어 무엇을 확인해야 하는지까지 안내해야 검토를 시작할 수 있었다.
