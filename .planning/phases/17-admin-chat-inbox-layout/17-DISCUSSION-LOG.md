# Phase 17: Admin Chat Inbox Layout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 17-Admin Chat Inbox Layout
**Areas discussed:** Sticky chrome, Viewport budget, Mobile layout, Scroll feel

---

## Sticky chrome

| Option | Description | Selected |
|--------|-------------|----------|
| H1 + tabs fixed | Скрол тільки всередині grid (Slack/Intercom style) | ✓ |
| Tabs only fixed | Заголовок може скролитись | |
| All fixed column | h1, tabs, grid — zero document scroll як одна колонка | |

**User's choice:** H1 «Чати» + таби фіксовані; zero document scroll на `/admin/chaty`; `space-y-6` між секціями; page wrapper = `flex flex-col` + grid `flex-1 min-h-0`.

**Notes:** Користувач обрав усі 4 питання явно; flex chain замість лише calc offset.

---

## Viewport budget

| Option | Description | Selected |
|--------|-------------|----------|
| Fill remaining | Grid = flex-1 під h1+tabs | ✓ |
| min + max cap | min-h + max-h viewport | |
| Fixed calc only | calc(100dvh - X) без flex-fill | |

**User's choice:** Fill remaining viewport; врахувати admin shell (sidebar, padding, mobile header); panels always full height (Messenger-style); keep 320px list column.

**Notes:** Empty states всередині full-height panel.

---

## Mobile layout

| Option | Description | Selected |
|--------|-------------|----------|
| Keep h1 on list | Без змін заголовка | ✓ |
| Tabs on thread view | Tabs лишаються, grid під tabs | ✓ |
| Back nav unchanged | Phase 8 «До списку» | Claude decides |
| Single panel scroll | Internal scroll активної панелі | Claude decides |

**User's choice:** Keep h1; tabs visible on thread view; back nav and mobile panel scroll container — planner discretion.

---

## Scroll feel

| Option | Description | Selected |
|--------|-------------|----------|
| Desktop ScrollArea | MessageList ScrollArea на desktop | ✓ |
| List native overflow | ConversationList overflow-y-auto | ✓ |
| Mobile admin thread | useNativeScroll vs ScrollArea | Claude decides |
| Auto-scroll behavior | Keep vs change MessageList logic | Claude decides |

**User's choice:** Desktop thread = ScrollArea; list = native; mobile thread scroll primitive and auto-scroll — planner picks based on Phase 06 patterns.

---

## Claude's Discretion

- Flex/grid class chain through admin shell
- Admin mobile `useNativeScroll` vs ScrollArea
- Mobile active panel overflow container placement
- Auto-scroll preservation after scroll container refactor
- Whether to produce `17-UI-SPEC.md`

## Deferred Ideas

None.
