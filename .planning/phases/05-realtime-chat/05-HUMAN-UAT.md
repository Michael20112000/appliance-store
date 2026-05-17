---
status: partial
phase: 05-realtime-chat
source: [05-VERIFICATION.md]
started: 2026-05-17T14:49:00Z
updated: 2026-05-17T14:49:00Z
---

## Current Test

number: 1
name: Live Pusher delivery
expected: |
  Відкрий чат як покупець (FAB або PDP), надішли повідомлення; у другій вкладці адмін на /admin/chaty з відкритим тредом — переконайся, що текст з’являється без F5 (потрібні Pusher env).
awaiting: user response

## Tests

### 1. Live Pusher delivery
expected: Повідомлення покупця видно в адмін-треді протягом кількох секунд без перезавантаження.
result: pending

### 2. Mobile chat UX
expected: Панель не перекривається системними елементами; composer і список прокручуються; FAB зникає коли панель відкрита.
result: pending

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
