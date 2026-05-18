# Phase 14 — Manual Checklist (ADM-CHAT-01)

**Run after:** Plans 14-01 through 14-03  
**Environment:** `npm run dev`, signed-in admin

| # | Route | Action | Expected | Pass |
|---|-------|--------|----------|------|
| 1 | `/admin/chaty` (desktop) | ПКМ по рядку inbox | Відкривається context menu; лівий клік по іншому рядку — вибір без «залиплого» меню | ☐ |
| 2 | `/admin/chaty` (desktop) | Delete з RCM → підтвердження | AlertDialog UA («Видалити діалог назавжди?»); після confirm — рядок зникає + toast | ☐ |
| 3 | `/admin/chaty` (desktop) | Archive з RCM на обраному треді | Тред очищається (selection знято); на необраному рядку — тред лишається відкритим | ☐ |
| 4 | `/admin/chaty` (mobile viewport) | Long-press / ПКМ по рядку | Немає context menu; відкрити тред → ⋮ archive/delete працюють | ☐ |
| 5 | `/admin/chaty` (вкладка Архів) | ПКМ по archived рядку | «Повернути з архіву» видно для `ARCHIVED` | ☐ |

**Notes:**

- Desktop breakpoint: `>767px` (`enableContextMenu={!isMobile}`).
- Keyboard lifecycle path: відкрити тред → ⋮ у шапці (без окремої ⋮ на рядку).
