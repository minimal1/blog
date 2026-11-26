---
title: "Spec Studio"
summary: "기획서와 Storybook 시안을 함께 검토하고, 실제 코드와 QA를 연결해 다음 작업의 기준을 남기는 제품 개발 도구"
status: "building"
startedAt: 2026-11-19
updatedAt: 2026-11-26
order: 3
milestones:
  - label: "변경 건 검토와 현행 명세 관리"
    state: "done"
  - label: "Storybook과 제품의 공용 UI 연결"
    state: "done"
  - label: "Aru에서 결과물 탐색"
    state: "done"
  - label: "다른 제품에 작업 방식 적용"
    state: "current"
---

Spec Studio는 AI와 제품을 만들 때 기획, 구현, 검증을 한 변경 건으로 묶는 도구다. 어떤 동작을 제안했고, 사람이 무엇을 승인했으며, 어느 코드에서 그 동작을 확인했는지를 제품 저장소에 남긴다.

화면이 바뀌는 일은 기획서와 함께 Storybook 시안을 검토한다. 시안에서는 가상 데이터로 화면을 띄우고 직접 조작해 볼 수 있다. 버튼과 입력창부터 반복해서 쓰는 폼과 페이지 배치까지, 시안과 제품은 같은 UI 코드를 사용한다.

사람이 요구사항과 시안을 승인하면 작업을 나눈다. 작업 계획도 승인받은 뒤 구현하고, QA에서 실제 코드가 완료 기준을 충족했는지 확인한다. 사람이 결과를 수용하면 확인한 동작을 현행 명세로 확정한다. 다음 변경은 그 명세에서 출발한다.

작업은 명령줄 도구로 진행한다. Aru 플러그인에서는 기획서, 작업, 현행 명세를 읽을 수 있고, 시안은 별도 Storybook에서 연다. Spec Studio 자체를 이 방식으로 개발했고, [통곡의 벽의 공용 UI를 준비할 때도 적용했다](/blog/projects/spec-studio/logs/04-storybook-in-wall-of-tears/).
