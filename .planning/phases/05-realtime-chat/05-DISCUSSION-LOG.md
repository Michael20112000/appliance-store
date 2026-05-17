# Phase 5: Realtime Chat - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 5-realtime-chat
**Areas discussed:** Модель діалогу, Точки входу, Адмін-інбокс, Realtime-транспорт, UX MVP, Віджет/UI

---

## 1. Модель діалогу

| Option | Description | Selected |
|--------|-------------|----------|
| Один чат на покупця | Єдиний тред buyer ↔ store | ✓ |
| Чат на товар | Окремий thread per product | |
| Чат на замовлення | Thread per order | |

**User's choice:** Один чат на покупця з магазином.
**Notes:** Контекст товару з PDP — metadata, не новий діалог (D-05-02).

---

## 2. Точки входу

| Option | Description | Selected |
|--------|-------------|----------|
| На розсуд Claude | FAB + PDP + kabinet per CONTEXT D-05-03…07 | ✓ |
| Тільки FAB | Без PDP/kabinet CTA | |
| Окрема сторінка /chat | Full page chat | |

**User's choice:** На свій розсуд.
**Notes:** Locked as global FAB, guest redirect, PDP link, kabinet CTA, no /chat page.

---

## 3. Адмін-інбокс

| Option | Description | Selected |
|--------|-------------|----------|
| На розсуд Claude | All admins, all threads, sort by activity | ✓ |
| Assign to manager | Per-thread ownership | |
| Polling only | No realtime in admin | |

**User's choice:** На свій розсуд.
**Notes:** Locked D-05-08…12 — enable `/admin/chaty`, unread badge.

---

## 4. Realtime-транспорт

| Option | Description | Selected |
|--------|-------------|----------|
| Pusher | Per REQUIREMENTS + ARCHITECTURE | ✓ |
| Ably | Alternative managed WS | |
| Polling fallback MVP | Simpler, not true realtime | |

**User's choice:** На свій розсуд.
**Notes:** Locked Pusher, DB-first, private channel auth (D-05-13…17).

---

## 5. UX чату (MVP)

| Option | Description | Selected |
|--------|-------------|----------|
| Мінімалістичний текст | No extras v1 | ✓ |
| + typing/read receipts | Richer UX | |
| + attachments | File upload in chat | |

**User's choice:** На свій розсуд.
**Notes:** Text only, 2000 char max, rate limit, «Магазин» label for admin (D-05-18…21).

---

## 6. Віджет / URL

| Option | Description | Selected |
|--------|-------------|----------|
| FAB bottom-right | Fixed button opens panel | ✓ |
| Dedicated /chat route | Standalone page | |
| /kabinet/chat only | Chat only in cabinet | |

**User's choice:** Віджет — кнопка в правому нижньому куті, по кліку з'являється чат.
**Notes:** No standalone chat page for MVP (D-05-07, D-05-21).

---

## Claude's Discretion

Areas 2–5 delegated to agent; resolutions documented as D-05-03 through D-05-21 in CONTEXT.md.

## Deferred Ideas

- Push/email on new message
- Chat attachments
- Typing indicators / read receipts / presence
- Per-order chat threads
