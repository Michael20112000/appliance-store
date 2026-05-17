---
phase: 5
slug: realtime-chat
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 1–4)"
created: 2026-05-17
locale: uk
extends: 04-UI-SPEC.md
---

# Phase 5 — UI Design Contract

> Realtime-чат покупець ↔ магазин: глобальний FAB-віджет на storefront, адмін-інбокс `/admin/chaty`. **Розширює** Phase 1–4 — токени, типографіка (4 розміри / 2 ваги), 60/30/10 **без змін**. Джерела: `05-CONTEXT.md` (D-05-01…D-05-21), `ROADMAP.md` Phase 5, `REQUIREMENTS.md` (CHAT-01…04, ADM-05, AUTH-03), `04-UI-SPEC.md`, код: `admin-nav.tsx`, `(storefront)/layout.tsx`, `kabinet/page.tsx`.

**Out of scope (UI):** push/email-нотифікації, вкладення/фото, typing indicator, read receipts, presence «менеджер онлайн», окрема сторінка `/chat`, assign діалогу менеджеру, polling fallback (лише Pusher + reload після reconnect).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn) |
| Icon library | `lucide-react` |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** |
| Document | `<html lang="uk">` |
| Storefront chrome | Повітряний layout без змін; чат — **overlay** поверх контенту |
| Admin chrome | `bg-muted` shell — без змін; інбокс у content panel `bg-background` |

**Не змінювати** OKLCH токени в `:root` / `@theme`.

**Phase 5 shadcn add (executor):**

```bash
npx shadcn@latest add scroll-area textarea avatar
```

**Вже в проєкті (reuse):** `button`, `badge`, `card`, `sheet`, `skeleton`, `separator`, `input`, `label`, `alert`, `sonner`.

**Registry:** лише shadcn official — third-party blocks **не** використовувати.

---

## Spacing Scale

**Успадковано з Phase 1** — див. `01-UI-SPEC.md`. Усі значення кратні 4.

| Token | Value | Phase 5 chat usage |
|-------|-------|---------------------|
| xs | 4px | Bubble internal padding tight, badge dot gap |
| sm | 8px | Message stack gap (`gap-2`), composer toolbar |
| md | 16px | Panel header/footer padding, list row padding |
| lg | 24px | FAB offset from viewport edge (`bottom-6 right-6` = 24px) |
| xl | 32px | Empty state vertical padding |
| 2xl | 48px | — |
| 3xl | 64px | — |

**Exceptions (chat-specific):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Touch target min | 44×44px | FAB, send button, admin list rows mobile |
| Chat panel width (desktop) | **380px** (`w-[380px]`) | Fixed panel anchored bottom-right |
| Chat panel height (desktop) | **min(520px, calc(100dvh - 120px))** | Не перекривати header; max ~70vh |
| Mobile sheet | `h-[85dvh]` or `h-dvh` bottom sheet | Full width, rounded top `rounded-t-xl` |
| FAB size | **56×56px** (`size-14`) | Круглий `rounded-full`, іконка 24px |
| FAB z-index | `z-[60]` | Вище header/footer; panel `z-[61]` |
| Safe area | `pb-[max(1rem,env(safe-area-inset-bottom))]` | FAB + mobile sheet bottom inset |
| Message max width | **85%** of thread | Bubbles не на всю ширину |
| Composer min height | 44px | Textarea 1 row default; max 4 rows (~120px) |
| Admin inbox list width (desktop) | **320px** (`w-80`) | Split view ліва колонка |
| Admin thread min width | `flex-1` | Права колонка |

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600). Чат переважно **Body + Label**.

| Role | Size | Weight | Line height | Phase 5 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Текст повідомлень, composer input |
| Label | 14px | 600 | 1.4 | Panel title «Чат з магазином», sender «Магазин», admin list buyer name |
| Heading | 20px | 600 | 1.2 | Admin page H1 **Чати** |
| Display | 28px | 600 | 1.15 | **Не використовувати** у чаті |

**Message meta (timestamp):** `text-xs` (12px) **допустимо** як вторинний текст — `text-muted-foreground`, не зменшувати body повідомлення.

**Time format (D-05-20):** `Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })` — напр. «17 трав., 14:32». Сьогодні — лише час; вчора — «вчора, 14:32» (опційно, planner).

---

## Color

**Успадковано** з Phase 1–4.

| Role | Token | Phase 5 chat usage |
|------|-------|---------------------|
| Dominant (60%) | `--background` | Panel/sheet surface, message area |
| Secondary (30%) | `--muted`, `--card`, `--border` | Incoming bubbles (магазин), list hover, disconnected banner |
| Accent (10%) | `--primary` | FAB, send button, buyer outgoing bubbles, unread dot |
| Destructive | `--destructive` | Send/rate-limit errors, optional nav badge if count > 0 |

### Message bubble colors

| Sender | Alignment | Background | Text | Border |
|--------|-----------|------------|------|--------|
| Покупець (buyer) | `justify-end` | `bg-primary text-primary-foreground` | inherit | none |
| Магазин (admin) | `justify-start` | `bg-muted` | `text-foreground` | `border border-border` optional |
| System / product context | center or full-width | `bg-muted/50` | `text-muted-foreground text-sm` | dashed `border-border` |

**Product context chip (PDP):** `bg-card border rounded-md px-3 py-2 text-sm` — не accent.

### Accent reserved for (Phase 5)

1. **FAB** (collapsed) — `bg-primary text-primary-foreground shadow-lg`
2. **«Надіслати»** / send icon button у composer
3. **«Відкрити чат»** на `/kabinet` — `Button variant="default"`
4. **«Запитати про цей товар»** на PDP — `Button variant="outline"` (secondary CTA поруч із primary «У кошик»; не два default поруч)
5. Unread indicator dot на FAB (buyer) — `bg-primary` ring on FAB
6. Active admin nav **Чати** — той самий стиль що інші active links (`bg-sidebar-accent`)
7. **Не accent:** message timestamps, list previews, «Назад» у mobile admin thread, close (X) ghost

### Disconnected banner

`bg-muted border-b border-border text-muted-foreground` — не destructive; лише текст + optional **«Оновити»** ghost.

---

## Architecture Overview

```
Storefront (storefront)/layout.tsx
├── … existing header/main/footer
└── ChatProvider (client)
    ├── ChatFab (fixed bottom-right)
    └── ChatPanel (desktop: fixed card | mobile: Sheet)

Admin /admin/chaty
└── AdminChatInbox
    ├── ConversationList (desktop: sidebar | mobile: full)
    └── ChatThread (+ ChatComposer reuse)
```

**Provider mount:** обгорнути `{children}` у `(storefront)/layout.tsx` **після** `NuqsAdapter` (для `?chat=open`). FAB рендериться sibling до `main`, не всередині scrollable content.

**Deep link:** `nuqs` param `chat=open` — відкриває панель; `productId` optional query для PDP context (planner).

**Guest flow (D-05-04):** клік FAB / PDP / kabinet без сесії → `router.push('/uviity?callbackUrl=' + encodeURIComponent(pathname + search))` — той самий патерн що `add-to-cart-button.tsx`.

---

## Component Inventory (Phase 5)

### shadcn (див. add command)

| Component | Usage |
|-----------|--------|
| `scroll-area` | Message list (widget + admin thread) — auto-scroll to bottom |
| `textarea` | `ChatComposer` — auto-resize, max 4 rows |
| `avatar` | Admin conversation list — buyer initials fallback |
| `sheet` | **Вже є** — mobile `ChatPanel` only |

### Custom components

| Component | Path | Responsibility |
|-----------|------|----------------|
| `ChatProvider` | `components/chat/chat-provider.tsx` | Open state, session, Pusher subscribe singleton, `?chat=open` |
| `ChatFab` | `components/chat/chat-fab.tsx` | Collapsed trigger, unread dot |
| `ChatPanel` | `components/chat/chat-panel.tsx` | Shell: header, messages, composer; desktop vs mobile |
| `MessageList` | `components/chat/message-list.tsx` | ScrollArea + skeleton + empty + bubbles |
| `MessageBubble` | `components/chat/message-bubble.tsx` | Single message + timestamp + sender label |
| `ChatComposer` | `components/chat/chat-composer.tsx` | Textarea + send, 2000 char counter, disabled states |
| `ProductContextBanner` | `components/chat/product-context-banner.tsx` | PDP context chip above composer |
| `AdminChatInbox` | `components/chat/admin-chat-inbox.tsx` | Split layout orchestrator |
| `ConversationList` | `components/chat/conversation-list.tsx` | Admin list rows, sort `updatedAt` desc |
| `ChatThread` | `components/chat/chat-thread.tsx` | Admin thread view + mark read |
| `OpenChatButton` | `components/chat/open-chat-button.tsx` | PDP + kabinet CTA (client) |

**Reuse:** `formatPriceKopiyky` не потрібен у чаті; buyer display name з session / User.

---

## `ChatFab`

**Purpose:** Глобальна точка входу (D-05-03).

| Property | Value |
|----------|-------|
| Position | `fixed z-[60]` — `bottom-6 right-6` + safe-area padding |
| Size | `size-14 rounded-full shadow-lg` |
| Icon | `MessageSquare` lucide, `size-6` |
| Variant | `Button` asChild or native `button` with `bg-primary text-primary-foreground` |
| `aria-label` | **«Відкрити чат з магазином»** |
| Collapsed state | Visible when panel closed |
| Hidden when | Panel open (optional fade) — або FAB стає close toggle (planner: **hide FAB when panel open**, close via panel X) |
| Unread (buyer) | `absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background` — якщо є непрочитані від магазину (post-MVP field; UI slot готовий) |

**Guest click:** redirect `/uviity?callbackUrl=…` — не відкривати panel.

---

## `ChatPanel`

**Purpose:** Розгорнутий чат (D-05-21).

### Desktop (md+)

| Property | Value |
|----------|-------|
| Container | `fixed z-[61] bottom-6 right-6 w-[380px]` + safe-area |
| Surface | `rounded-xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden` |
| Height | `h-[min(520px,calc(100dvh-7rem))]` |

### Mobile (<md)

| Property | Value |
|----------|-------|
| Pattern | `Sheet` `side="bottom"` `className="h-[85dvh] p-0 gap-0"` |
| Width | Full viewport width |

### Header (shared)

| Element | Spec |
|---------|------|
| Title | **«Чат з магазином»** — Label 14px semibold |
| Subtitle | `text-xs text-muted-foreground` — **«Відповімо якнайшвидше»** |
| Close | `Button variant="ghost" size="icon"` — `X` icon, `aria-label="Закрити чат"` |
| Border | `border-b border-border px-4 py-3` |

### Body

`MessageList` — `flex-1 min-h-0` (flex child for scroll).

### Footer

`ProductContextBanner` (conditional) + `ChatComposer`.

---

## `MessageBubble`

| Property | Buyer message | Store message |
|----------|---------------|---------------|
| Wrapper | `flex justify-end` | `flex justify-start` |
| Bubble | `rounded-2xl rounded-br-md px-3 py-2 max-w-[85%] bg-primary text-primary-foreground` | `rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%] bg-muted border border-border` |
| Sender label | — | **«Магазин»** above bubble — `text-xs font-semibold text-muted-foreground mb-0.5` (D-05-20) |
| Body | `text-base whitespace-pre-wrap break-words` | same |
| Timestamp | below bubble, `text-xs text-muted-foreground mt-1` | same |
| Long text | wrap; no truncation in bubble | |

**Admin thread view:** buyer messages show buyer name (truncated email or name) as label above left-aligned muted bubble; store messages still **«Магазин»**.

**Optimistic pending:** opacity `0.7` + no timestamp until ACK.

---

## `ChatComposer`

| Property | Value |
|----------|-------|
| Container | `border-t border-border p-3 bg-background` |
| Input | `Textarea` `placeholder="Напишіть повідомлення…"` rows=1, `maxLength={2000}` |
| Send | Icon `Send` or text **«Надіслати»** — `Button size="icon"` primary, disabled when empty or over limit |
| Char hint | `text-xs text-muted-foreground` — show when `length > 1800`: «{n}/2000» |
| Submit | Enter sends; **Shift+Enter** newline |
| Loading | Disable input + send; send shows `aria-busy` |
| Max height | 4 rows then scroll inside textarea |

**Errors (inline below composer):** `text-sm text-destructive` — rate limit, validation, send fail.

---

## `ProductContextBanner`

Shown when widget opened from PDP (D-05-02, D-05-05).

| Property | Value |
|----------|-------|
| Content | **«Питання про: {productTitle}»** — truncate 2 lines |
| Optional link | Ghost link **«Переглянути товар»** → `/tovar/{slug}` |
| Dismiss | Optional X — context лишається в metadata першого повідомлення навіть якщо приховано |
| Style | `mx-3 mt-2 rounded-md border bg-card px-3 py-2 text-sm` |

**Prefill:** не автозаповнювати textarea повним текстом; лише banner (CONTEXT: metadata on first message).

---

## Admin: `AdminNav` update

**Replace** disabled block in `admin-nav.tsx` (D-05-10, D-04-06).

| Before (Phase 4) | After (Phase 5) |
|------------------|-----------------|
| `<span aria-disabled>` + badge **«Незабаром»** | `<Link href="/admin/chaty">` active pattern |
| — | Unread **count badge** when `unreadTotal > 0` |

| Property | Value |
|----------|-------|
| `href` | `/admin/chaty` |
| Label | **Чати** |
| Icon | `MessageSquare` |
| Active | `pathname.startsWith('/admin/chaty')` |
| Badge | `Badge variant="destructive"` or `default` — numeric count, cap display **«99+»** |
| Badge position | `ml-auto` on nav row |
| `aria-label` | **«Чати, {n} непрочитаних»** when count > 0 |

**Data:** unread count from server — RSC layout prop or small client poll on nav mount (planner); UI contract requires visible aggregate count.

---

## Page: `/admin/chaty`

**Purpose:** ADM-05, CHAT-04 — всі діалоги, single-store (D-05-08).

| Zone | Desktop | Mobile |
|------|---------|--------|
| Layout | CSS grid `grid-cols-[320px_1fr] min-h-[calc(100dvh-12rem)]` | Stack: list OR thread |
| H1 | **Чати** (page level, above grid or in list column header) | same |
| List | `ConversationList` always visible | Full width until thread selected |
| Thread | `ChatThread` + composer | Full width; back button **«← До списку»** |

### `ConversationList`

| Column / row | Content |
|--------------|---------|
| Row height | min 56px, `px-3 py-3` |
| Avatar | `Avatar` initials from buyer name |
| Primary | Buyer name or email truncated — Label 14px semibold |
| Secondary | Last message preview — `text-sm text-muted-foreground line-clamp-1` |
| Meta | Relative time right — `text-xs` |
| Unread row | `font-semibold` + `bg-muted/50` or left border `border-l-2 border-primary` |
| Sort | `updatedAt` desc (D-05-09) |
| Empty | **«Ще немає повідомлень»** + **«Коли покупець напише, діалог з’явиться тут.»** |
| Loading | 6× `Skeleton` rows |

### `ChatThread` (admin)

| Zone | Content |
|------|---------|
| Header | Buyer name + email muted; optional order link stub **не в MVP** |
| Messages | Reuse `MessageList` + `MessageBubble` (admin labels) |
| Composer | Reuse `ChatComposer` — same 2000 limit |
| Empty selection | **«Оберіть діалог»** centered — `text-muted-foreground` |
| Mobile back | `Button variant="ghost" size="sm"` **«← До списку»** |

**Mark read:** on thread open / focus — server mutation (planner); clears row unread + nav badge aggregate.

---

## Storefront integration points

### `(storefront)/layout.tsx`

```tsx
<NuqsAdapter>
  <CartPendingMergeGate />
  {children}
</NuqsAdapter>
<ChatProvider />  {/* FAB + Panel portal */}
```

### `/kabinet` (D-05-06)

| Replace | With |
|---------|------|
| Stub paragraph про «наступну фазу» | Section **«Повідомлення»** |
| — | `OpenChatButton` label **«Відкрити чат»** `variant="default"` |
| — | Helper: **«Пишіть магазину з питаннями про товари та замовлення.»** |

### PDP `/tovar/[slug]` (D-05-05)

Below `AddToCartButton`, stack `gap-3`:

| Control | Spec |
|---------|------|
| `OpenChatButton` | `variant="outline"` full width on mobile — **«Запитати про цей товар»** |
| Props | `productId`, `productTitle`, `productSlug` |
| Guest | Same redirect as FAB with `callbackUrl` current PDP |
| Auth | Opens widget + sets product context |

---

## UI States

### Loading

| Surface | Pattern |
|---------|---------|
| Message history | 4–6 `Skeleton` bubbles alternating left/right in `MessageList` |
| Send in flight | Optimistic bubble + disabled composer |
| Admin list | 6 skeleton rows |
| Initial panel open | Full message area skeleton until first fetch |

### Empty

| Surface | Heading | Body | CTA |
|---------|---------|------|-----|
| Buyer — no messages yet | **«Напишіть нам»** | **«Маєте питання про товар чи замовлення? Ми відповімо тут.»** | — (composer active) |
| Admin — no conversations | **«Ще немає повідомлень»** | **«Коли покупець напише, діалог з’явиться тут.»** | — |
| Admin — no selection | **«Оберіть діалог»** | **«Оберіть покупця зі списку, щоб відповісти.»** | — |

### Error

| Context | Copy |
|---------|------|
| Load history fail | **«Не вдалося завантажити повідомлення. Спробуйте оновити сторінку.»** |
| Send fail | **«Не вдалося надіслати. Спробуйте ще раз.»** |
| Rate limit | **«Забагато повідомлень. Зачекайте хвилину.»** |
| Over 2000 chars | **«Повідомлення занадто довге (максимум 2000 символів).»** |
| Pusher auth fail | **«Не вдалося підключитися до чату. Увійдіть знову або оновіть сторінку.»** |
| Not authenticated | Redirect — no inline error |

### Disconnected (D-05-17)

| Element | Spec |
|---------|------|
| Placement | Sticky top of message area inside panel/thread |
| Copy | **«З’єднання перервано. Повідомлення можуть затримуватися.»** |
| Action | **«Оновити»** ghost — refetch messages + resubscribe Pusher |
| Style | `bg-muted px-3 py-2 text-sm text-muted-foreground` |
| Clear | Hide when Pusher `connected` |

**No typing indicator, no read receipts, no file upload UI** (D-05-19).

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| FAB aria-label | **«Відкрити чат з магазином»** |
| Panel title | **«Чат з магазином»** |
| Panel subtitle | **«Відповімо якнайшвидше»** |
| Composer placeholder | **«Напишіть повідомлення…»** |
| Primary CTA send | **«Надіслати»** (or icon-only with `aria-label="Надіслати"`) |
| PDP CTA | **«Запитати про цей товар»** |
| Kabinet CTA | **«Відкрити чат»** |
| Store sender label | **«Магазин»** |
| Product context | **«Питання про: {productTitle}»** |
| Empty buyer | **«Напишіть нам»** / **«Маєте питання про товар чи замовлення? Ми відповімо тут.»** |
| Empty admin list | **«Ще немає повідомлень»** |
| Error send | **«Не вдалося надіслати. Спробуйте ще раз.»** |
| Disconnected | **«З’єднання перервано. Повідомлення можуть затримуватися.»** |
| Admin back (mobile) | **«← До списку»** |
| Admin nav | **«Чати»** (no «Незабаром») |

**Microcopy:** char limit hint **«{n}/2000»**; loading send **«Надсилання…»**; close **«Закрити чат»**

**Destructive actions:** немає в MVP (delete message out of scope).

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | `lang="uk"`; всі strings UA |
| FAB | `aria-label`; focusable; not covered by panel when open |
| Panel | Focus trap when open (Sheet handles on mobile); Esc closes |
| Live region | New incoming message: `aria-live="polite"` on message list container (append announcement optional) |
| Composer | `<Label className="sr-only">` **«Повідомлення»**; `aria-invalid` on validation |
| Send | Disabled state `aria-disabled`; loading `aria-busy` |
| Color | Bubbles not color-only — sender label for store |
| Touch | FAB 56px; send 44px min |
| Admin list | Rows are `<button>` or `<Link>` with full row hit area; `aria-current` on selected |
| Nav badge | Count in `aria-label` for Чати |
| Motion | Respect `prefers-reduced-motion` — no slide animation on panel optional |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | scroll-area, textarea, avatar (+ existing sheet, button, badge, skeleton) | not required |
| Third-party | **none** | — |

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| CHAT-01 | FAB, PDP button, kabinet CTA, guest redirect |
| CHAT-02 | Pusher-driven live append; disconnected banner + reload |
| CHAT-03 | MessageList loads history on open; persists across reload |
| CHAT-04 | `/admin/chaty` inbox, split/list-mobile, admin composer |
| ADM-05 | Admin chat UI + enabled nav |
| AUTH-03 | Guest → `/uviity?callbackUrl` before chat |
| UI-01 | Ukrainian copy throughout |
| UI-03 | Mobile sheet panel, responsive admin inbox |

| Decision | UI-SPEC coverage |
|----------|------------------|
| D-05-01 | Single thread in widget |
| D-05-02–07 | Product banner, no `/chat` page, kabinet CTA |
| D-05-08–12 | Admin inbox layout, nav enable + badge |
| D-05-18–21 | Composer limits, «Магазин» label, FAB/panel sizes |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

<!-- UI-SPEC COMPLETE — ready for gsd-ui-checker validation -->
