---
phase: 29-product-cards-pdp-core-ux
verified: 2026-05-20T14:48:00Z
status: human_needed
score: 21/22
overrides_applied: 0
human_verification:
  - test: "На desktop відкрий каталог з карткою, у якої 3+ фото. Наведи курсор на картку."
    expected: "Одразу видно перше фото; далі кожні ~3 с плавний crossfade (opacity ~300ms) між превʼю. Після зняття курсора — знову перше фото, без таймера."
    why_human: "Візуальний таймінг і плавність opacity не перевіряються grep/build."
  - test: "На mobile (або DevTools <768px) відкрий ту саму картку."
    expected: "Лише перше зображення; немає автопрокрутки й циклу по тапу."
    why_human: "Поведінка залежить від viewport і touch, не від unit-тестів."
  - test: "Увімкни OS «Зменшити рух» (prefers-reduced-motion) і hover на desktop-картці з кількома фото."
    expected: "Зображення статичне (перше), без ротації."
    why_human: "matchMedia поведінку треба підтвердити в браузері."
  - test: "На PDP з кількома фото відкрий lightbox (тап по головному зображенню). Частково перетягни слайд (~30–50%) і відпусти палець."
    expected: "Карусель мʼяко доїжджає до найближчого слайду без різкого стрибка/відскоку після release."
    why_human: "PDP-05 — відчуття Embla drag/snap; у коді лише opts, не UX-якість."
  - test: "Закрий lightbox і знову відкрий з того ж thumbnail."
    expected: "Немає видимого стрибка, якщо слайд уже на місці."
    why_human: "Перевірка scrollTo skip/jump — лише візуально."
  - test: "На PDP додай товар у кошик."
    expected: "Рядок «Вже в кошику» (disabled secondary) + лише icon trash; немає «Перейти до кошика» в блоці AddToCartButton."
    why_human: "Копірайт і композиція UI."
  - test: "При count ≥ 1 на PDP перевір FAB кошика над ChatFab."
    expected: "FAB з іконкою кошика, badge з числом (9+ при >9), тап веде на /koszyk; ChatFab лишається bottom-6 z-[60]."
    why_human: "Вертикальний стек і safe-area — візуально."
  - test: "Гість: додай/прибери товар без логіну."
    expected: "Badge FAB оновлюється без full reload (pending-storage + CART_CHANGED_EVENT)."
    why_human: "Клієнтська подія та localStorage."
  - test: "Залогінений: додай/прибери товар на PDP."
    expected: "Після дії FAB відображає актуальний count (router.refresh → initialCount)."
    why_human: "Серверний count + refresh цикл."
  - test: "Переконайся, що OpenChatButton на PDP і глобальний ChatFab працюють як раніше."
    expected: "Чат відкривається; файли chat-fab.tsx / chat-provider.tsx не змінювались у фазі."
    why_human: "Регресія поза scope автоматичних grep-перевірок."
---

# Phase 29: Product cards & PDP core UX — Verification Report

**Phase Goal:** Картки й PDP відчуваються плавними; кошик на PDP без зайвих кнопок (CARD-01, PDP-05, PDP-06).

**Verified:** 2026-05-20T14:48:00Z

**Status:** human_needed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | D-01 / CARD-01: `PublicProductCard.previewImages` до 5 з list query | ✓ VERIFIED | `catalog.service.ts` `take: 5`, `mapToCard`; тип у `catalog.ts` |
| 2 | D-02: Desktop hover crossfade ~3s; перше фото одразу на enter | ✓ VERIFIED | `ROTATION_MS = 3000`; `setActiveIndex(0)` перед `setInterval` у `product-card-image-stack.tsx` |
| 3 | D-03: Touch/mobile — лише перше фото | ✓ VERIFIED | `canRotate` вимагає `md` + `(hover: hover) and (pointer: fine)` |
| 4 | D-04: `prefers-reduced-motion` — без ротації | ✓ VERIFIED | `motionQuery.matches` у `canRotate` |
| 5 | D-05: Ротація зупиняється на mouseleave | ✓ VERIFIED | `handleMouseLeave` → `clearRotation` + `setActiveIndex(0)` |
| 6 | D-06: Один образ — без таймера | ✓ VERIFIED | `images.length === 1` → один `OptimizedImage` |
| 7 | D-07 / PDP-05: Lightbox snap без jerk після release | ? UNCERTAIN | `dragFree: false`, `duration: 25`, `scrollTo(..., false)` — потрібен manual swipe |
| 8 | D-08: Loop у lightbox при кількох фото | ✓ VERIFIED | `loop: hasMultiple` у dialog `Carousel` opts |
| 9 | D-09: Thumbnail strip без регресії | ✓ VERIFIED | Thumbnail `opts` лишились `align: start`, `containScroll: trimSnaps` |
| 10 | D-10: In-cart «Вже в кошику» | ✓ VERIFIED | `add-to-cart-button.tsx` рядки 87–96 |
| 11 | D-11: Trash icon-only remove | ✓ VERIFIED | `Trash2`, `size="icon"`, `aria-label` з назвою товару |
| 12 | D-12: Немає «Перейти до кошика» в AddToCartButton | ✓ VERIFIED | `grep` по `add-to-cart-button.tsx` — 0 збігів |
| 13 | D-13: Максимум два контроли в in-cart row | ✓ VERIFIED | `flex gap-2` з двома `Button` |
| 14 | D-14: Guest/session логіка add/remove без змін | ✓ VERIFIED | `pending-storage` / `addToCartAction` / `removeFromCartAction` збережені |
| 15 | D-15: `PdpCartFab` лише на PDP | ✓ VERIFIED | Імпорт/монтаж тільки в `tovar/[slug]/page.tsx` |
| 16 | D-16: FAB при count ≥ 1 | ✓ VERIFIED | `if (count < 1) return null` |
| 17 | D-17: Guest FAB — `getPendingItemCount` + `CART_CHANGED_EVENT` | ✓ VERIFIED | `pdp-cart-fab.tsx` useEffect для гостя |
| 18 | D-18: FAB над ChatFab + safe-area | ✓ VERIFIED | `bottom-[5.75rem] z-[59]` vs chat `bottom-6 z-[60]`; `env(safe-area-inset-bottom)` |
| 19 | D-19: FAB → `/koszyk`, badge, ShoppingCart | ✓ VERIFIED | `Link href="/koszyk"`, badge `9+` |
| 20 | D-20: ChatFab / OpenChatButton без змін у фазі | ✓ VERIFIED | `chat-fab.tsx` не в `files_modified`; `OpenChatButton` на PDP |
| 21 | D-21: Vitest для `mapToCard` previewImages | ✓ VERIFIED | `catalog.service.test.ts` 16/16 pass |
| 22 | D-22: Build green; manual UAT | ⚠️ PARTIAL | `npm run build` OK; phase tests OK; full `npm test` 3 fail у `prisma/seed.test.ts` (локальна БД) |

**Score:** 21/22 truths verified programmatically (D-07 потребує людини)

### Roadmap Success Criteria

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Desktop hover multi-image — fade ~3s | ✓ VERIFIED (code) | Human: візуальний crossfade |
| 2 | Lightbox swipe без jerk | ? UNCERTAIN | Embla opts на місці |
| 3 | «Вже в кошику» + trash; FAB над чатом; ≤2 кнопки | ✓ VERIFIED | Human: стек FAB |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/catalog/product-card-image-stack.tsx` | Client hover stack | ✓ VERIFIED | 105 рядків; wired з `product-card.tsx` |
| `src/server/services/catalog.service.ts` | take 5 + mapper | ✓ VERIFIED | `take: 5`, `mapToCard` exported |
| `src/components/catalog/product-gallery.tsx` | Lightbox Embla opts | ✓ VERIFIED | `dragFree: false`, `duration: 25` |
| `src/components/cart/pdp-cart-fab.tsx` | PDP FAB | ✓ VERIFIED | 55 рядків; guest sync |
| `src/components/cart/add-to-cart-button.tsx` | In-cart layout | ✓ VERIFIED | Містить «Вже в кошику» |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `product-card.tsx` | `product-card-image-stack.tsx` | `previewImages` prop | ✓ WIRED | `ProductCardImageStack` при `length > 0` |
| `product-gallery.tsx` | `carousel.tsx` | dialog `opts` | ✓ WIRED | `duration`, `dragFree`, `loop` |
| `tovar/[slug]/page.tsx` | `pdp-cart-fab.tsx` | `initialCount`, `hasSession` | ✓ WIRED | `getCartItemCount` для session |
| `add-to-cart-button.tsx` | cart actions / pending | handlers | ✓ WIRED | Без Link на `/koszyk` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Real Data | Status |
|----------|---------------|--------|-----------|--------|
| `ProductCardImageStack` | `images` | `product.previewImages` з Prisma list | ✓ | ✓ FLOWING |
| `ProductGallery` dialog | `sorted` | `product.images` PDP query | ✓ | ✓ FLOWING |
| `PdpCartFab` | `count` | `getCartItemCount` / `getPendingItemCount` | ✓ | ✓ FLOWING |
| `AddToCartButton` | `inCart` | session query / pending-storage | ✓ | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| mapToCard previewImages ≤5 | `npm test -- catalog.service.test.ts` | 16/16 pass | ✓ PASS |
| No inline go-to-cart in button | `! grep 'Перейти до кошика' add-to-cart-button.tsx` | no match | ✓ PASS |
| Production build | `npm run build` | exit 0 | ✓ PASS |
| Full test suite | `npm test` | 3 fail `prisma/seed.test.ts` only | ⚠️ ENV |

**Step 7b note:** Spot-checks не запускали dev server; swipe/hover — у human_verification.

### Probe Execution

Step 7c: SKIPPED — фаза без probe scripts.

### Requirements Coverage

| Requirement | Source Plan | Description (REQUIREMENTS.md) | Status | Evidence |
|-------------|-------------|-------------------------------|--------|----------|
| CARD-01 | 29-01 | Desktop hover fade-ротація ~3 с | ✓ SATISFIED (code) | Stack + mapper; UAT візуально |
| PDP-05 | 29-02 | Lightbox без jerk після release | ? NEEDS HUMAN | Embla opts; feel не в коді |
| PDP-06 | 29-03 | «Вже в кошику» + trash; FAB над чатом | ✓ SATISFIED (code) | add-to-cart + pdp-cart-fab |

Усі три ID з PLAN frontmatter покриті. Orphaned requirements для Phase 29 у REQUIREMENTS.md — немає.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | TBD/FIXME/XXX у phase files | — | Немає |
| — | — | Stub/placeholder у нових компонентах | — | Немає |

**Примітка:** `npm test` падає на `prisma/seed.test.ts` (недостатньо seed-даних локально) — не блокер реалізації фази; `catalog.service.test.ts` і build зелені.

### Human Verification Required

Див. YAML `human_verification` (українською). Пріоритет після `npm run dev`:

1. Desktop hover + reduced motion (картки каталогу)
2. Mobile static card
3. Lightbox partial drag/release (PDP-05)
4. In-cart row + FAB stack (PDP-06)
5. Guest vs session badge sync

### Gaps Summary

Автоматичних **BLOCKER**-гепів немає: артефакти існують, зʼєднані, mapper і UI-копірайт відповідають CARD-01 / PDP-06. Єдиний must-have без програмного підтвердження — **відчуття lightbox snap (D-07 / PDP-05)**. Фаза **не** `passed` до human UAT (статус `human_needed` за правилом Step 9).

---

_Verified: 2026-05-20T14:48:00Z_
_Verifier: Claude (gsd-verifier)_
