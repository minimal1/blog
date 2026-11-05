---
title: "하루 만 건을 버티는 가장 단순한 수집기"
description: "현재 규모에 맞춰 큐를 빼고, 실패를 관찰할 수 있는 단순한 저장 경로부터 만들었다."
publishedAt: 2026-09-12
project: "quiet-metrics"
kind: "build"
tags: ["개발", "아키텍처", "운영"]
---

이벤트 수집기를 설계하면서 가장 먼저 한 일은 예상 트래픽을 적는 것이었습니다. 베타 단계에서 기대하는 양은 하루 만 건 미만입니다. 이 숫자라면 복잡한 메시지 큐는 아직 필요하지 않습니다.

## 지금의 경로

수집 요청은 세 단계를 거칩니다.

1. 허용된 필드만 검증한다.
2. 짧은 시간 단위로 이벤트를 묶는다.
3. 집계가 끝난 원본은 삭제한다.

처리량보다 중요한 것은 실패를 숨기지 않는 것입니다. 거절된 이벤트 수와 집계 지연 시간을 함께 남겨, 데이터가 조용히 사라지는 상황을 확인할 수 있게 했습니다.

```ts
type EventPayload = {
  name: string;
  occurredAt: Date;
  properties: Record<string, string | number>;
};

export function acceptEvent(event: EventPayload) {
  const isRecent = Date.now() - event.occurredAt.getTime() < 60_000;

  return isRecent && event.name.length > 0;
}
```

## 나중으로 미룬 것

재시도 큐와 지역별 수집 서버는 구현하지 않았습니다. 실제 병목을 확인한 뒤 추가해도 늦지 않습니다. 지금의 목표는 확장 가능한 그림이 아니라, 이해하고 고칠 수 있는 작은 시스템입니다.
