# Phase 26: Footer & mobile contact - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver storefront **footer** and **mobile drawer** contact UX (FOOT-01…04): contacts and address from **admin-managed store settings** (not hardcoded env stubs), callback phone request form (footer + drawer), category `productCount` badges in drawer, UA phone validation with inline errors and success toast.

Includes: new **admin settings page** (phones, emails, addresses CRUD/edit), **callback requests** persisted in DB with list on that page, rate-limited guest submission.

Out of scope: changing catalog filter rules (`buildCatalogContextWhere`), homepage category grid (Phase 25), product edit auto-save, order status logic, email notifications to admin on new callback (unless trivial with existing infra), full Maps SDK / heavy third-party scripts, chat FAB changes, moving unrelated pages to admin settings beyond storefront contact surfaces.

</domain>

<decisions>
## Implementation Decisions

### Store settings — admin source of truth (FOOT-01)
- **D-01:** Add an **admin settings page** (new sidebar nav item) where operators manage **phones**, **emails**, and **addresses** (each type may have **multiple entries** — e.g. two phones, two addresses).
- **D-02:** Persist settings in **database** (not `STORE_PHONE` / env as primary source for footer). Planner may use a singleton row + JSON arrays or normalized child tables; must support multiple values per type.
- **D-03:** Storefront renders **only non-empty** values configured in admin. If a type has zero entries → **omit that block entirely** on the frontend (no «незабаром» placeholder).
- **D-04:** **Phone:** display **human-readable** formatting (e.g. `+38 (050) 123-45-67`) with `href="tel:..."` using normalized digits (same normalization approach as checkout storage).
- **D-05:** **Email:** `mailto:` links for each configured email.
- **D-06:** **Address:** show full text (operator example: «Львів, Кавалерідзе 19»). **Click address** opens external map (Google Maps / OSM URL built from text or stored map URL field). **Additionally:** embed a **mini map with pin** in the footer — **always visible** on desktop layout, **`loading="lazy"`** iframe (or equivalent) **below the fold** so LCP/PageSpeed is not regressed; no heavy Maps JS SDK on initial load.
- **D-07:** Migrate storefront contact consumption away from footer stub and align **`getStoreNap()` / homepage** contact snippets to read the same store settings where they show phone/address (avoid duplicate sources of truth).

### Callback requests (FOOT-02, FOOT-03)
- **D-08:** New **`CallbackRequest`** (or equivalent) **Prisma model** + server action; store phone, timestamp, optional metadata (IP for rate limit).
- **D-09:** **Admin:** section **«Заявки на дзвінок»** on the settings page (or clearly adjacent block) — list recent requests (newest first; planner defines pagination/limit).
- **D-10:** **Guest-only** submission — no login required (same as checkout).
- **D-11:** **Validation:** reuse checkout **`uaPhoneSchema`** rules (trim, 10–15 digits, same error copy style).
- **D-12:** **Success:** `toast.success` «Дякуємо, передзвонимо» + **clear phone field**.
- **D-13:** **Errors:** **inline only** under the field (validation + server/network); **no `toast.error`** on failure.
- **D-14:** **Rate limit** on server action — e.g. **N requests per hour per IP** (return friendly inline/server message when exceeded).
- **D-15:** **Copy:** label/heading **«Вкажіть свій номер — ми передзвонимо»**; submit button **«Передзвоніть мені»**.
- **D-16:** Single shared client component **`CallbackRequestForm`** used in **footer** and **mobile drawer** (identical behavior and copy).

### Mobile drawer — categories & form (FOOT-03, FOOT-04)
- **D-17:** Under category list: **separator**, then **`CallbackRequestForm`** (no duplicate contact block in drawer — contacts stay in footer).
- **D-18:** **Category counts:** show **`productCount`** as **muted badge** aligned **right** of category name (not inline parentheses).
- **D-19:** Categories with **`productCount === 0`** remain **excluded** from drawer list (existing `categoriesWithAvailableProducts` pipeline from header — do not show zero-count categories).
- **D-20:** For every category shown, **always** display the count badge (all visible rows have count ≥ 1).

### Footer layout (FOOT-01, FOOT-02)
- **D-21:** **Desktop:** two-column — **left:** contacts + address + lazy map embed; **right:** callback form.
- **D-22:** **Footer bottom:** keep **© + brand** row as today («Техніка б/у Львів»); do not duplicate bare «м. Львів» if full address is already shown (D-06 supersedes stub line).

### Tests & quality (ROADMAP)
- **D-23:** Unit tests for phone schema reuse / callback validator; server action rate-limit behavior where testable; update or add tests for drawer count rendering contract. `npm run build` required.

### Folded Todos
- **BUG-23** (v1.5 intake): Footer + mobile drawer — phone, email, callback, counts → covered by this phase.

### Claude's Discretion
- Exact Prisma schema (singleton `StoreSettings` vs normalized `StorePhone`/`StoreEmail`/`StoreAddress` tables).
- Admin form UX (repeatable fields, drag order, primary flag).
- Map embed provider (Google Maps embed URL vs OpenStreetMap) and coordinate storage vs geocoding from address string.
- Rate limit N and storage (memory vs DB) for serverless — prefer simple durable-enough approach.
- Whether to deprecate `STORE_PHONE` env or keep as seed/fallback only (prefer DB-only for display per D-02).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — **FOOT-01…04**
- `.planning/ROADMAP.md` — Phase 26 success criteria
- `.planning/todos/pending/bugfix-intake-2026-05-19-v1.5.md` — **BUG-23**

### Storefront — current targets
- `src/components/layout/store-footer.tsx` — stub to replace
- `src/components/layout/store-mobile-nav.tsx` — add counts + callback form
- `src/components/layout/store-header.tsx` — passes categories to drawer
- `src/lib/catalog/store-nap.ts` — align with DB settings
- `src/lib/env.ts` — `STORE_PHONE` / `STORE_ADDRESS` (legacy; D-07)

### Catalog counts (FOOT-04)
- `src/lib/catalog/categories.ts` — `categoriesWithAvailableProducts`
- `src/server/services/catalog.service.ts` — `listCategoriesWithProductCounts`
- `.planning/phases/25-homepage-empty-categories/25-CONTEXT.md` — count definition locked

### Phone validation (callback)
- `src/server/validators/order.ts` — `uaPhoneSchema`
- `src/server/validators/order.test.ts` — accepted formats
- `src/components/checkout/checkout-form.tsx` — reference UX for phone field

### Admin patterns
- `src/components/admin/admin-nav-items.ts` — add settings nav entry
- `src/components/admin/app-sidebar.tsx` — sidebar integration
- `prisma/schema.prisma` — new models + migration

### Prior deferrals
- `.planning/phases/25-homepage-empty-categories/25-PATTERNS.md` — FOOT-04 deferred here

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `uaPhoneSchema` — extract or share for callback validator (avoid drift from checkout).
- `listCategoriesWithProductCounts` + `categoriesWithAvailableProducts` — header already passes filtered categories with `productCount`; wire badge in `StoreMobileNav`.
- `StoreMobileNav` type already has optional `productCount` — render only UI missing.
- Toast pattern from admin/product flows for **success only** (D-13 forbids error toasts).

### Established Patterns
- Server actions + Zod validators in `src/server/validators/` and `src/server/actions/`.
- Admin CRUD pages under `src/app/(admin)/admin/` with shadcn forms.
- Footer is server component today; callback form will be client island; settings fetched server-side for footer.

### Integration Points
- `src/app/(storefront)/layout.tsx` — `StoreFooter` + `StoreHeader`.
- New admin route e.g. `/admin/nalashtuvannia` or `/admin/kontakty` (planner picks Ukrainian slug consistent with app).
- Prisma migration for settings + callback requests.

</code_context>

<specifics>
## Specific Ideas

- Operator example address: **Львів, Кавалерідзе 19** — click opens map; lazy iframe map beside/below address in footer without hurting PageSpeed.
- User explicitly rejected env-only contacts and «незабаром» placeholders — admin DB is the source of truth.

</specifics>

<deferred>
## Deferred Ideas

- **Email/push notification** to operator on new callback — not requested; add in future phase if needed.
- **Contacts block inside mobile drawer** — user chose categories + callback only in drawer; footer holds contacts/map.
- **CAPTCHA / honeypot** beyond IP rate limit — deferred unless spam appears in production.

</deferred>

---

*Phase: 26-footer-mobile-contact*
*Context gathered: 2026-05-19*
