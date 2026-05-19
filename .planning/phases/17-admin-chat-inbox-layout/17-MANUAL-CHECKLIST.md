# Phase 17 — Admin Chat Inbox Layout — Manual Checklist

**Run after:** Plans 17-01 through 17-03 (layout shell, internal scroll, verification artifacts)  
**Decisions:** D-17-15 (10+ dialogs, long thread, zero page scroll), D-17-16 (Phase 14/8 UX regression)

## Prerequisites

- `npm run dev` running; admin signed in
- Seed data: **10+** conversations on **Активні** tab when possible; at least one thread with **50+** messages for long-thread checks
- Viewports: desktop **1280×720**, mobile **390×844**

---

## Layout & scroll

### Desktop

- [ ] **10+ conversations:** Open `/admin/chaty` with 10+ rows in the list. Scroll the left column — only the list scrolls; the browser page (document) does **not** scroll.
- [ ] **Long thread (50+ messages):** Select a conversation with a long history. Scroll messages — only the thread panel scrolls; H1 **Чати**, tabs **Активні** / **Архів**, thread header, and **Надіслати** composer stay fixed; the page does **not** scroll.
- [ ] **1–2 conversations:** With few rows, the inbox grid still fills the remaining viewport height; unselected thread shows **Оберіть діалог** / **Оберіть покупця зі списку, щоб відповісти.** centered in the right panel (no collapsed short grid).

### Mobile

- [ ] **List view:** At list-only state — H1 **Чати** and tabs visible; list scrolls internally; **no page scroll**.
- [ ] **Thread view:** Open a thread — H1, tabs, and **До списку** visible; messages scroll internally; composer at bottom of thread column; **no page scroll**.
- [ ] **List ↔ thread:** Switch with **До списку** and row tap — no layout jump that breaks scroll containers or hides chrome incorrectly.

### Tabs

- [ ] **Активні ↔ Архів:** Switch tabs — H1 and tabs stay fixed; panels reflow without enabling document scroll.

---

## Phase 14 / 8 UX (unchanged)

- [ ] **Desktop ПКМ:** Right-click an inbox row — context menu with **Архівувати** / **Повернути з архіву** / **Видалити** (per row state); left-click another row still selects without a stuck menu.
- [ ] **Desktop left-click:** Left-click row opens thread and `#admin-chat-message` composer (non-archived).
- [ ] **Desktop thread ⋮:** Lifecycle menu in thread header unchanged.
- [ ] **Mobile row:** No row context menu on long-press/ПКМ; open thread → ⋮ lifecycle works.
- [ ] **Delete:** **Видалити** → AlertDialog **Видалити діалог назавжди?** still appears; confirm flow unchanged.

---

## Realtime / messages

- [ ] **Open thread:** Opening a thread scrolls to latest (or preserves near-bottom behavior).
- [ ] **New message near bottom:** While near bottom, a new message auto-scrolls the thread panel.
- [ ] **Pusher append (optional):** If dev realtime connected, incoming message does not break scroll containers.

---

## Shell / other routes

- [ ] **Other admin route:** Visit `/admin/zamovlennia` (or another admin page) — layout not broken by shell `min-h-0` changes.
- [ ] **Mobile shell:** Admin mobile header (`h-12`) visible; chat page fills remaining viewport below it.

---

## Sign-off

| Field | Value |
|-------|-------|
| Date | 2026-05-19 |
| Operator | Michael Ivashko |
| Result | Pass |
| Failing items (if any) | — |

**Approved:** Operator typed `approved` after manual regression (layout, list pages fix verified).
