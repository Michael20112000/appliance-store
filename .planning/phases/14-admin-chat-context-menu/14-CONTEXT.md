# Phase 14: Admin Chat Context Menu - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

На `/admin/chaty` **ПКМ по рядку** в списку діалогів (inbox) відкриває контекстне меню з тим самим набором дій, що **⋮** у шапці відкритого треда (`chat-thread.tsx`): архівувати / повернути з архіву / видалити назавжди (з підтвердженням).

**Лівий клік** по рядку лишається — вибір діалогу й відкриття треда (mobile і desktop).

**Не в цій фазі:** нові server actions або зміна chat lifecycle (Phase 8); long-press на mobile; ⋮ на кожному рядку списку; зміни buyer-side чату; Pusher/realtime; нові вкладки inbox.

</domain>

<decisions>
## Implementation Decisions

### Context menu component (ADM-CHAT-01)
- **D-14-01:** Встановити shadcn **`context-menu`** (`npx shadcn@latest add context-menu`). ПКМ на рядку inbox — **`ContextMenu`** + `ContextMenuTrigger` / `ContextMenuContent` / `ContextMenuItem` (destructive для delete).
- **D-14-02:** **`DropdownMenu` у шапці треда** (`chat-thread.tsx`) **залишити** — не замінювати на ContextMenu; семантика різна (кнопка ⋮ vs ПКМ по списку).
- **D-14-03:** На `onContextMenu` рядка — **`preventDefault()`**, щоб не показувалось нативне браузерне меню і не конфліктувало з лівим кліком.

### Shared lifecycle actions
- **D-14-04:** Винести спільну логіку дій (handlers, `useTransition`, `AlertDialog` для delete, toasts, виклики `archiveConversationAction` / `unarchiveConversationAction` / `deleteConversationAction`) в **один shared модуль** — напр. `useConversationLifecycleActions(conversationId, { view, status })` або `ConversationLifecycleMenuItems` + спільний delete dialog. **`chat-thread.tsx` і список** споживають той самий код — без копіпасти трьох handler-ів.
- **D-14-05:** **Ті самі server actions** що зараз у `src/server/actions/admin/chat.actions.ts` — нових mutation не додавати.

### Action visibility (parity with thread ⋮)
- **D-14-06:** Пункти меню на рядку **ідентичні правилам** `chat-thread.tsx`:
  - `view === "active"` і `status === "OPEN"` → **«Архівувати»**
  - `view === "archive"` і `status === "ARCHIVED"` → **«Повернути з архіву»**
  - **«Видалити назавжди»** — завжди (destructive), з тим самим `AlertDialog` текстом українською що в треді.

### Post-action behavior
- **D-14-07:** Після дії зі списку — **та сама поведінка**, що з ⋮ у треді (через shared hook):
  - архів / delete → `clearSelectionAndRefresh()` + success toast
  - розархів → `refreshInbox()` + toast
- **D-14-08:** Якщо ПКМ по **необраному** рядку — дія виконується для **цього** `conversationId`; після delete/archive, якщо це був обраний тред — selection знімається (як у треді).

### Mobile / touch
- **D-14-09:** **Контекстне меню лише для desktop ПКМ** — не імплементувати long-press і не додавати ⋮ на рядок списку на mobile.
- **D-14-10:** На **mobile (`<md`)** адмін робить archive/delete/unarchive через **⋮ у шапці треда** після відкриття діалогу (існуючий UX Phase 8) — без регресії.

### Click vs menu (list row)
- **D-14-11:** Рядок inbox лишається **клікабельним** (`onClick` → `onSelect`); вибір пункту контекстного меню — **`onSelect` на MenuItem** без спрацьовування navigate/select (стандартна поведінка ContextMenu, не bubble до row click після закриття меню).
- **D-14-12:** Патерн Phase 11: якщо на рядку з’являться додаткові інтерактивні елементи — **`stopPropagation`**; у цій фазі рядок = trigger + click, без окремих кнопок на рядку.

### Accessibility
- **D-14-13:** Список лишає **`role="listbox"`** / `role="option"` на рядках. ContextMenu з shadcn дає keyboard/focus для меню; **keyboard-only шлях для lifecycle** на MVP — відкрити тред → ⋮ (не дублювати окрему клавіатурну ⋮ на рядку).
- **D-14-14:** `aria-label` на trigger/меню українською (напр. «Дії з діалогом») — узгодити з тредом.

### Verification
- **D-14-15:** Розширити **`e2e/admin-chat.spec.ts`** (якщо є) — desktop: ПКМ → архів з active list; за потреби skip на mobile viewport.
- **D-14-16:** Manual checklist: ПКМ не ламає лівий клік; delete показує confirm; після delete рядок зникає; mobile без ПКМ — тред ⋮ працює.

### Claude's Discretion
- Точна форма shared модуля (hook vs compound component + один `AlertDialog` provider).
- Чи обгортати весь `<button>` рядка в `ContextMenuTrigger`, чи wrapper `div` навколо row (planner: зберегти a11y listbox).
- Refactor `chat-thread.tsx` лише настільки, щоб прибрати дубль — без зміни візуалу шапки.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — admin chat ПКМ у backlog v1.2
- `.planning/REQUIREMENTS.md` — **ADM-CHAT-01**
- `.planning/ROADMAP.md` — Phase 14 goal and success criteria
- `.planning/STATE.md` — milestone v1.2 Polish & UX

### Prior phase context (chat lifecycle — do not re-decide)
- `.planning/phases/08-admin-ux-chat-lifecycle/08-CONTEXT.md` — D-08-15…D-08-22 archive/delete, inbox tabs, thread ⋮
- `.planning/phases/08-admin-ux-chat-lifecycle/08-UI-SPEC.md` — admin chat layout
- `.planning/phases/05-realtime-chat/05-CONTEXT.md` — one conversation per buyer
- `.planning/phases/11-admin-list-row-ux/11-CONTEXT.md` — D-11-12 `stopPropagation` on nested controls

### Code (primary touchpoints)
- `src/components/chat/conversation-list.tsx` — inbox rows (add ContextMenu)
- `src/components/chat/chat-thread.tsx` — reference ⋮ menu + handlers to extract
- `src/components/chat/admin-chat-inbox.tsx` — passes `onSelect`, view, conversations
- `src/components/chat/admin-chat-provider.tsx` — `clearSelectionAndRefresh`, `refreshInbox`, `view`
- `src/server/actions/admin/chat.actions.ts` — archive / unarchive / delete
- `src/lib/admin-chat-url.ts` — active/archive URL
- `src/components/ui/dropdown-menu.tsx` — existing (thread only)
- `components.json` — shadcn config for `context-menu` install

### shadcn (install in phase)
- shadcn `context-menu` component — add via CLI during implementation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `chat-thread.tsx` — повний еталон пунктів меню, `AlertDialog`, toasts, `pending` state (витягнути в shared module).
- `admin-chat-provider.tsx` — `view`, `clearSelectionAndRefresh`, `refreshInbox` після lifecycle.
- `conversation-list.tsx` — `<button role="option" onClick={onSelect}>` — обгорнути ContextMenu без зміни select UX.
- `dropdown-menu.tsx` — лишається для треда.

### Established Patterns
- Phase 8: hard delete + confirm UA copy; archive vs active tabs via `AdminChatView`.
- Phase 11: row click primary; nested controls need `stopPropagation` (на майбутнє).
- Admin actions: `src/server/actions/admin/chat.actions.ts` + toast sonner.

### Integration Points
- `ConversationList` отримує `conversations` + `onSelect`; потрібен `view` (з props або context) для visibility правил меню — **`useAdminChat().view`** у client list item.
- Після install: `src/components/ui/context-menu.tsx`.

</code_context>

<specifics>
## Specific Ideas

- Користувач обрав **shadcn ContextMenu** (не DropdownMenu-hack на ПКМ).
- **Mobile:** контекстне меню тільки desktop ПКМ; на touch — дії лише через ⋮ у треді.
- Обговорено всі зони: component, shared logic, mobile, post-action, a11y.

</specifics>

<deferred>
## Deferred Ideas

- ⋮ на кожному рядку inbox (mobile + desktop) — відхилено; залишено desktop ПКМ + thread ⋮.
- Long-press context menu на mobile — out of scope (нестабільна веб-поведінка).
- Keyboard ⋮ на рядку списку — deferred; достатньо thread ⋮ для a11y MVP.

</deferred>

---

*Phase: 14-Admin Chat Context Menu*
*Context gathered: 2026-05-18*
