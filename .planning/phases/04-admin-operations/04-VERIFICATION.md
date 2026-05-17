---
phase: 04-admin-operations
verified: 2026-05-17T13:36:00Z
status: human_needed
score: 14/14
overrides_applied: 0
human_verification:
  - test: "Увійти як admin, відкрити /admin/tovary/{id}, завантажити 1–2 фото через Cloudinary widget"
    expected: "Upload проходить без помилки; превʼю зʼявляються; після збереження фото видно після reload сторінки"
    why_human: "Підпис `/api/upload/sign` і `syncProductImages` перевірені кодом/юніт-тестами; реальний upload залежить від Cloudinary preset/секретів у середовищі"
  - test: "Запустити `npm run test:e2e -- e2e/admin-rbac.spec.ts e2e/admin-categories.spec.ts e2e/admin-products.spec.ts e2e/admin-orders.spec.ts` на dev-сервері з seed admin"
    expected: "Усі 4 spec green (RBAC redirect, category CRUD, product publish smoke, order status)"
    why_human: "E2E не запускались у verifier (потрібен running app + DB); файли існують і покривають AUTH-04 + ADM-01–04"
  - test: "Після першого deploy перевірити Cloudinary dashboard (signed preset / folder policy)"
    expected: "Upload policy відповідає signed-only; публічні unsigned uploads вимкнені"
    why_human: "Операційна перевірка поза репозиторієм (04-CONTEXT optional human-verify)"
---

# Phase 4: Admin Operations Verification Report

**Phase Goal:** Адміністратор магазину повністю керує асортиментом і замовленнями через захищену адмінку  
**Verified:** 2026-05-17T13:36:00Z  
**Status:** human_needed  
**Re-verification:** No — initial verification

> **MVP mode note:** ROADMAP позначає `mode: mvp`, але phase goal **не** у форматі User Story (`As a …, I want …, so that …`). Плани 04-01–04-05 мають user stories на рівні планів; нижче User Flow Coverage зібрано з ROADMAP Success Criteria + outcome фази.

## User Flow Coverage

**Outcome:** адмін керує категоріями, товарами (кілька фото) і замовленнями лише через `/admin/*` з RBAC.

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Вхід admin | `/admin` відкривається з dashboard | `layout.tsx` → `requireAdmin()`; `page.tsx` → `getAdminDashboardStats()` | ✓ |
| RBAC buyer | Покупець на `/admin` → redirect login | `requireAdmin()` → `redirect("/uviity")`; `e2e/admin-rbac.spec.ts` | ✓ |
| Категорії CRUD | List/create/edit/delete на `/admin/kategorii` | `admin-catalog.service.ts`, `category.actions.ts`, pages `kategorii/*` | ✓ |
| Товари CRUD | List/filters, create/edit на `/admin/tovary` | `admin-product.service.ts`, `product.actions.ts`, pages `tovary/*` | ✓ |
| Фото товару | Signed upload + `ProductImage` rows | `product-image-upload.tsx` → `signatureEndpoint="/api/upload/sign"`; `syncProductImages` | ✓ (code) |
| Замовлення | Список + деталь + зміна статусу | `admin-order.service.ts`, `zamovlennia/*`, `order-status-select.tsx` | ✓ |
| Скасування | `CANCELLED` → `SOLD`→`AVAILABLE` | `revertSoldProductsOnCancel` in `admin-order.service.ts` | ✓ |
| Чати (defer) | Nav disabled «Незабаром», без реалізації | `admin-nav.tsx` — ADM-05 → Phase 5 | ✓ |

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Користувач без `role admin` не відкриває `/admin` (server-side) | ✓ VERIFIED | `src/app/(admin)/admin/layout.tsx:16` — `await requireAdmin()` |
| 2 | Адмін CRUD категорій на `/admin/kategorii` | ✓ VERIFIED | `admin-catalog.service.ts` + `category.actions.ts` + pages; delete guard `CATEGORY_HAS_PRODUCTS` |
| 3 | Адмін CRUD товарів (поля + статуси + фільтри) | ✓ VERIFIED | `admin-product.service.ts` `listAdminProducts` / `createProduct` / `updateProduct`; `SOLD` не змінюється з форми |
| 4 | Кілька фото через signed Cloudinary + `ProductImage` | ✓ VERIFIED | `POST /api/upload/sign` + `ProductImageUpload` + `syncProductImages` (Prisma transaction) |
| 5 | Адмін переглядає замовлення і змінює статус | ✓ VERIFIED | `listAllOrders` `orderBy: createdAt desc`; `updateOrderStatus` + UI select |
| 6 | Скасування повертає товар `SOLD`→`AVAILABLE` | ✓ VERIFIED | `revertSoldProductsOnCancel` при `newStatus === "CANCELLED"` |
| 7 | Недопустимі переходи статусу відхиляються | ✓ VERIFIED | `assertTransitionAllowed` + `INVALID_STATUS_TRANSITION`; unit tests |
| 8 | Buyer/unauth не отримують підпис upload | ✓ VERIFIED | `assertAdminApi()` → 401; `route.test.ts` buyer + unauth cases |
| 9 | Відсутні Cloudinary secrets → 503 без витоку | ✓ VERIFIED | `CloudinaryNotConfiguredError` → `{ error: "CLOUDINARY_NOT_CONFIGURED" }` status 503 |
| 10 | `requireAdmin()` у всіх admin server actions | ✓ VERIFIED | `category.actions.ts`, `product.actions.ts`, `order.actions.ts` — 8 call sites |
| 11 | Зміни категорій/товарів revalidate storefront | ✓ VERIFIED | `revalidatePath("/katalog")`, `/tovar/[slug]`, `/` у actions |
| 12 | Dashboard з live counts | ✓ VERIFIED | `getAdminDashboardStats()` — Prisma `count` / `findMany` |
| 13 | AdminNav: усі секції + «Чати» disabled | ✓ VERIFIED | `admin-nav.tsx` — `Незабаром` badge, no href |
| 14 | ADM-05 (chat admin) не в scope фази | ✓ VERIFIED | Deferred to Phase 5 per ROADMAP; disabled nav only |

**Score:** 14/14 truths verified (automated); runtime E2E + live Cloudinary upload потребують human pass

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | ADM-05 — адмін керує чатами | Phase 5 | ROADMAP Phase 5 requirements CHAT-*; `admin-nav` «Чати» disabled |

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/lib/cloudinary.ts` | Server sign + fail-fast config | ✓ VERIFIED | `getCloudinaryConfig`, `signUploadParams`, `api_sign_request` |
| `src/app/api/upload/sign/route.ts` | Admin-only POST sign | ✓ VERIFIED | `assertAdminApi` + JSON signature |
| `src/server/services/admin-catalog.service.ts` | Category CRUD + slug | ✓ VERIFIED | 113 lines, Prisma queries |
| `src/server/actions/admin/category.actions.ts` | Actions + revalidate | ✓ WIRED | Calls service after Zod |
| `src/app/(admin)/admin/kategorii/page.tsx` | List table | ✓ VERIFIED | `listCategoriesAdmin()` |
| `src/server/services/admin-product.service.ts` | Product CRUD + images | ✓ VERIFIED | `syncProductImages` deleteMany + createMany |
| `src/components/admin/product-image-upload.tsx` | CldUploadWidget | ✓ WIRED | `signatureEndpoint="/api/upload/sign"` |
| `src/server/services/admin-order.service.ts` | Orders + transitions + revert | ✓ VERIFIED | Transaction on status update |
| `src/app/(admin)/admin/page.tsx` | Dashboard | ✓ VERIFIED | StatCard grid + recent orders |
| `src/components/admin/admin-nav.tsx` | Full sidebar | ✓ VERIFIED | 4 enabled links + disabled Чати |
| `e2e/admin-rbac.spec.ts` | RBAC proof | ✓ EXISTS | Buyer redirect + sign 401; admin sign 200 when secrets |
| `e2e/admin-categories.spec.ts` | Category smoke | ✓ EXISTS | Create + delete flow |
| `e2e/admin-products.spec.ts` | Product smoke | ✓ EXISTS | (not executed in verifier) |
| `e2e/admin-orders.spec.ts` | Order smoke | ✓ EXISTS | (not executed in verifier) |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `admin/layout.tsx` | `requireAdmin()` | layout guard | ✓ WIRED | Before render |
| `category.actions.ts` | `admin-catalog.service` | service calls | ✓ WIRED | create/update/delete |
| `category.actions.ts` | `/katalog` | `revalidatePath` | ✓ WIRED | After mutations |
| `product-image-upload.tsx` | `/api/upload/sign` | `signatureEndpoint` | ✓ WIRED | Line 144 |
| `product.actions.ts` | `syncProductImages` | `saveProductImagesAction` | ✓ WIRED | After upload |
| `upload/sign/route.ts` | `signUploadParams` | POST handler | ✓ WIRED | Returns `{ signature }` |
| `admin-order.service` | `prisma.product.updateMany` | cancel revert | ✓ WIRED | `status: "SOLD"` filter |
| `order.actions.ts` | `updateOrderStatus` | `updateOrderStatusAction` | ✓ WIRED | `requireAdmin` first |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `kategorii/page.tsx` | `categories` | `listCategoriesAdmin()` → `prisma.category.findMany` | Yes | ✓ FLOWING |
| `tovary/page.tsx` | `result.items` | `listAdminProducts()` → `prisma.product.findMany` | Yes | ✓ FLOWING |
| `admin/page.tsx` | `stats` | `getAdminDashboardStats()` → `prisma.count/findMany` | Yes | ✓ FLOWING |
| `zamovlennia/page.tsx` | `orders` | `listAllOrders()` → `prisma.order.findMany` | Yes | ✓ FLOWING |
| `product-image-upload.tsx` | `images` | Widget upload → `saveProductImagesAction` → `syncProductImages` | Yes (after upload) | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Admin unit suite | `npm test -- --run src/server/services/admin-*.test.ts src/app/api/upload/sign/route.test.ts` | 4 files, 36 tests passed | ✓ PASS |
| cloudinary dependency | `grep cloudinary package.json` | `"cloudinary": "^2.10.0"` | ✓ PASS |
| No secret in NEXT_PUBLIC | `! grep -r NEXT_PUBLIC_CLOUDINARY_API_SECRET src/` | no matches | ✓ PASS |
| Admin E2E suite | `npm run test:e2e -- e2e/admin-*.spec.ts` | Not run (needs dev server) | ? SKIP |

### Probe Execution

Step 7c: SKIPPED — no `scripts/*/tests/probe-*.sh` declared for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| AUTH-04 | 04-02, 04-05 | Admin role; `/admin` only admin | ✓ SATISFIED | `requireAdmin` layout + actions; `e2e/admin-rbac.spec.ts` |
| ADM-01 | 04-02, 04-05 | Category CRUD | ✓ SATISFIED | `admin-catalog.service` + `/admin/kategorii/*` |
| ADM-02 | 04-03, 04-05 | Product CRUD fields | ✓ SATISFIED | `admin-product.service` + forms/pages |
| ADM-03 | 04-01, 04-03 | Multi-image Cloudinary | ✓ SATISFIED | sign route + widget + `ProductImage` sync |
| ADM-04 | 04-04, 04-05 | Orders view + status | ✓ SATISFIED | `admin-order.service` + zamovlennia UI |
| ADM-05 | — | Chat admin | ⏭ DEFERRED | Phase 5; disabled nav only (not a gap) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX in admin phase files | — | None |
| — | — | No stub `return []` / placeholder admin pages | — | None |

### Human Verification Required

### 1. Cloudinary upload у браузері

**Test:** Admin → товар → завантажити фото через widget.  
**Expected:** Upload успішний, зображення зберігаються в БД і видно після reload.  
**Why human:** Потрібні живі Cloudinary credentials/preset у `.env`.

### 2. Playwright admin E2E

**Test:** `npm run test:e2e -- e2e/admin-*.spec.ts` з піднятим `npm run dev` і seed.  
**Expected:** 4 spec files green.  
**Why human:** Verifier не запускав браузерні тести.

### 3. Cloudinary dashboard (post-deploy)

**Test:** Перевірити signed upload policy у Cloudinary console.  
**Expected:** Unsigned public upload вимкнено.  
**Why human:** Зовнішня консоль, не в коді.

### Gaps Summary

Автоматична верифікація коду **не знайшла blockers**: RBAC, CRUD, order transitions, cancel revert, signed upload route і Prisma image sync — усе імплементовано й покрито юніт-тестами (36 passed).

**Статус `human_needed`** — не через прогалини в коді, а через обовʼязковий runtime/UAT шар: реальний Cloudinary upload у браузері та повний Playwright admin suite не виконувались у verifier. Після green human checks фазу можна вважати повністю закритою для verify-work.

---

_Verified: 2026-05-17T13:36:00Z_  
_Verifier: Claude (gsd-verifier)_
