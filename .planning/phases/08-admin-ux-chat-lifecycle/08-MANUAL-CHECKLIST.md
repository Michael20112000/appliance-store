# Phase 8 — Manual verification checklist

Operator gate before closing **admin-ux-chat-lifecycle**. Matches ROADMAP Phase 8 success criteria (FIX-01, ADM-01–03, CHAT-05–06) plus buyer archived read-only (D-08-23).

**Prerequisites:** `npm run dev` running, database seeded with at least one order, category, product, and chat conversation.

---

## 1. FIX-01 — Dashboard drafts link

- [ ] Open `/admin` (signed in as admin)
- [ ] Click **Чернетки** stat card
- [ ] URL is `/admin/tovary?status=DRAFT` and table shows draft products only

## 2. ADM-01 — Admin sidebar (mobile + desktop)

- [ ] **Desktop (`md+`):** Sidebar visible; collapse toggle shrinks to icon rail; nav links work (Замовлення, Чати, Категорії, …)
- [ ] **Mobile (`< md`):** `SidebarTrigger` opens Sheet overlay; tap outside or navigate closes sheet; content not hidden behind sidebar

## 3. ADM-02 — Orders pagination, sort, page size

- [ ] Open `/admin/zamovlennia`
- [ ] Change **page size** (10 / 20 / 50); URL updates; row count matches
- [ ] Click sortable column headers; URL `sort` / `dir` updates; order changes
- [ ] Paginate forward/back; `сторінка` in URL matches table

## 4. ADM-03 — Categories table without Slug column

- [ ] Open `/admin/kategorii`
- [ ] Table has name/actions columns; **no Slug column** visible

## 5. CHAT-05 — Archive flow (active → archive → restore)

- [ ] Open `/admin/chaty`, tab **Активні**
- [ ] Select a conversation → menu **Архівувати** → toast **Діалог архівовано**
- [ ] Conversation disappears from **Активні**
- [ ] Tab **Архів** → same thread listed; open thread — history visible; admin can still reply
- [ ] **Повернути з архіву** → toast **Діалог повернуто в активні**; thread back under **Активні**

## 6. CHAT-06 — Delete with confirm + DB gone

- [ ] On archived (or active) thread → **Видалити діалог** → confirm in `AlertDialog`
- [ ] Toast **Діалог видалено**; thread gone from list
- [ ] Optional DB check: no `Conversation` / `Message` rows for that id

## 7. Buyer archived read-only (D-08-23)

- [ ] As buyer (session), open storefront chat for a thread admin **archived**
- [ ] Message history visible
- [ ] Banner **Діалог закрито магазином** above composer
- [ ] Composer disabled; placeholder **Діалог закрито**; send does nothing
- [ ] Optional: DevTools POST to `/api/chat/messages` returns **403** `CHAT_ARCHIVED`

---

## Automated regression (not manual)

```bash
npm test -- src/server/services/chat.service.test.ts src/server/services/admin-order.service.test.ts src/server/validators/admin-order.test.ts src/lib/admin/orders-url.test.ts src/app/api/chat/messages/route.test.ts
```

```bash
npm run test:e2e -- e2e/admin-chat.spec.ts
```

No Playwright coverage for archive/delete lifecycle (D-08-27) — manual sections 5–7 only.

---

**Sign-off:** Date ______ | Verified by ______
