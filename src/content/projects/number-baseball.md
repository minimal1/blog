---
title: "숫자야구"
summary: "아내와 함께 하려고 하루 만에 만들어 배포한 온라인 숫자야구. 1대1 대전과 2~4인 생존전을 지원한다"
status: "building"
startedAt: 2026-11-27
updatedAt: 2026-11-28
order: 5
links:
  website: "https://minimal1.github.io/minimal-number-baseball/"
  repository: "https://github.com/minimal1/minimal-number-baseball"
milestones:
  - label: "규칙 정리와 1대1 구현"
    state: "done"
  - label: "2~4인 방과 로비 구현"
    state: "done"
  - label: "지인들과 실전 플레이"
    state: "current"
  - label: "POC 판정과 다음 단계 결정"
    state: "upcoming"
---

숫자야구는 상대가 정한 비밀 숫자를 맞추는 추리 게임이다. 아내와 처음 해봤는데 다음 날에도 하고 싶다는 말이 나와서, 온라인에서도 바로 할 수 있게 만들었다. 마침 주말에 친구와 만나기로 해서 네 명이서 하는 생존전도 함께 넣었다.

규칙은 단순하다. 0부터 9까지 카드 가운데 중복 없이 3장 또는 4장을 비밀 숫자로 정한다. 숫자와 자리가 모두 맞으면 스트라이크, 숫자만 맞으면 볼이다. 방을 만든 사람이 코드를 공유하면 상대가 그 코드로 입장한다. 비밀 선택과 각 턴에는 제한 시간이 있고, 시간을 넘기면 서버가 자동으로 투구한다.

판정과 방 관리는 Cloudflare Workers가 전담한다. 상대의 비밀 숫자는 게임이 끝나기 전까지 화면에 전송되지 않는다. 화면은 GitHub Pages에 올린 단일 HTML 파일이고, 빌드 과정은 없다.

화면 연출은 픽셀 카드 스타일이다. 직접 해본 적은 없는 게임 Balatro의 UI와 이펙트가 인상에 남아 참고했다. 카드를 쾅 놓거나 찢는 연출로 턴 사이의 밋밋함을 덜려고 했다.

지금은 POC 단계다. 지인들과 직접 플레이하면서 어디가 부족한지 확인하고, 그 결과를 보고 다음 방향을 정한다.
