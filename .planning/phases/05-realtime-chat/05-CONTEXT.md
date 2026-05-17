# Phase 5: Realtime Chat - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Авторизований покупець спілкується з магазином у **одному постійному діалозі** через **плаваючий віджет** (кнопка внизу справа). Повідомлення доставляються в realtime, зберігаються в PostgreSQL, історія переживає reload. Адмін відповідає з `/admin/chaty` (інбокс усіх діалогів).

**Не в цій фазі:** push/email-нотифікації, вкладення/фото в чаті, typing/read receipts, окремі чати на товар/замовлення, OAuth.

</domain>

<decisions>
## Implementation Decisions

### Модель діалогу
- **D-05-01:** **Один `Conversation` на покупця** (`userId` unique) — єдиний тред «покупець ↔ магазин», не окремий чат на товар чи замовлення.
- **D-05-02:** Контекст товару з PDP — **опційний metadata** (`productId` / `productTitle` snapshot) на першому повідомленні або полі `contextProductId` на conversation; **не** створює новий діалог.

### Точки входу (Claude's discretion → locked)
- **D-05-03:** **Глобальний FAB-віджет** у `(storefront)/layout` — fixed `bottom-right`, вище footer, `z-index` достатній для mobile safe-area.
- **D-05-04:** **Гість:** клік по FAB → redirect на `/uviity` з `callbackUrl` (як кошик, AUTH-03).
- **D-05-05:** **PDP:** додаткова текстова кнопка «Запитати про цей товар» — відкриває той самий віджет і передає `productId` для prefill/контексту першого повідомлення.
- **D-05-06:** **`/kabinet`:** прибрати заглушку; CTA «Відкрити чат» відкриває віджет (client state / `?chat=open` через nuqs — на розсуд planner).
- **D-05-07:** **Окремої сторінки `/chat` для MVP немає** — тільки віджет; deep-link лише через query або programmatic open.

### Адмін-інбокс (Claude's discretion → locked)
- **D-05-08:** **Усі адміни бачать усі діалоги** (single-store); без assign менеджеру.
- **D-05-09:** Сортування списку: **останнє повідомлення** (`updatedAt` desc).
- **D-05-10:** Увімкнути nav **«Чати»** → `/admin/chaty` (замість disabled «Незабаром», D-04-06).
- **D-05-11:** Desktop: **split view** (список + тред); mobile: список → тред.
- **D-05-12:** **Badge непрочитаних** на пункті «Чати» в admin nav (buyer message після `lastReadAt` адміна або простий `unreadForAdmin` на conversation — деталі в plan).

### Realtime-транспорт (Claude's discretion → locked)
- **D-05-13:** **Pusher Channels** (CHAT-02, REQUIREMENTS) — `pusher` (server) + `pusher-js` (client).
- **D-05-14:** **DB-first:** `INSERT Message` → `pusher.trigger('private-conversation-{id}', 'message:new', payload)`.
- **D-05-15:** **Private channel** + `POST /api/chat/pusher/auth` — перевірка session + ownership conversation (PITFALLS #6).
- **D-05-16:** **Один singleton** realtime client module; підписка в `ChatProvider`, не в кожному компоненті.
- **D-05-17:** Admin inbox: polling fallback **не** в MVP — лише Pusher; якщо disconnect — reload history після reconnect.

### UX чату MVP (Claude's discretion → locked)
- **D-05-18:** Лише **текстові** повідомлення; max **2000** символів; rate-limit на send.
- **D-05-19:** **Без** typing indicator, read receipts, file upload, «менеджер онлайн» на v1.
- **D-05-20:** Відображення часу повідомлення (локальний формат UA); адмін-повідомлення підписані як **«Магазин»** (не ім'я конкретного адміна в UI).
- **D-05-21:** Віджет: згорнутий = FAB з іконкою `MessageSquare`; розгорнутий = панель (~380px desktop, **full-width sheet** на mobile).

### Claude's Discretion (resolved)
Користувач делегував пункти 2–5; рішення зафіксовані в D-05-03…D-05-21 вище.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — core value, auth для чату, single-store
- `.planning/REQUIREMENTS.md` — CHAT-01…04, ADM-05, AUTH-03
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria
- `.planning/STATE.md` — accumulated decisions (cart, checkout, admin)

### Prior phase context
- `.planning/phases/04-admin-operations/04-CONTEXT.md` — D-04-06 disabled «Чати» → replace in Phase 5
- `.planning/phases/04-admin-operations/04-UI-SPEC.md` — admin shell, disabled Чати nav spec
- `.planning/phases/04-admin-operations/04-PATTERNS.md` — admin actions, `requireAdmin`

### Research & pitfalls
- `.planning/research/ARCHITECTURE.md` — `chat.service`, DB-first + Pusher, route layout `chaty/`, `api/chat/`
- `.planning/research/PITFALLS.md` — Pitfall #6 (channel auth, singleton, persist first)
- `.planning/research/STACK.md` — stack versions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/permissions.ts` — `requireBuyer()`, `requireAdmin()`
- `src/app/(admin)/admin/layout.tsx` — admin shell + role guard
- `src/components/admin/admin-nav.tsx` — disabled «Чати» → enable + link `/admin/chaty`
- `src/app/(storefront)/layout.tsx` — mount point for global chat widget provider
- `src/app/(storefront)/kabinet/page.tsx` — replace chat stub with open-widget CTA
- Admin patterns: `server/services/*`, `server/actions/*`, Zod validators, toast errors

### Established Patterns
- RSC reads + Client islands for interactive UI
- Server Actions or thin Route Handlers for mutations
- Ukrainian URL segments (`/kabinet`, `/admin/zamovlennia`)
- Auth redirect: `requireBuyer("/path")` with callback

### Integration Points
- Prisma: new `Conversation` + `Message` models (not in schema yet)
- Storefront layout: FAB + panel above footer
- Admin nav: enable «Чати», unread badge
- Env: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` (+ public key for client)

</code_context>

<specifics>
## Specific Ideas

- **Віджет, не окрема сторінка:** фіксована кнопка чату в правому нижньому куті; по кліку — панель чату (user-specified).
- Один діалог на покупця — простіше для локального магазину і для адміна.
- «Запитати про товар» на PDP — контекст, не новий чат.

</specifics>

<deferred>
## Deferred Ideas

- Push / email при новому повідомленні — v2 (NOTF-01)
- Фото/файли в чаті — окрема фаза або v2
- Typing indicator, read receipts, presence — post-MVP polish
- Окремий чат на замовлення — out of scope (один тред на покупця)

</deferred>

---

*Phase: 05-Realtime Chat*
*Context gathered: 2026-05-17*
