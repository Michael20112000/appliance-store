---
status: passed
phase: 29-product-cards-pdp-core-ux
source: [29-VERIFICATION.md]
started: 2026-05-20T15:05:00Z
updated: 2026-05-20T16:00:00Z
---

## Current Test

[complete — approved by user]

## Tests

### 1. Desktop hover crossfade (CARD-01)
expected: На desktop відкрий каталог з карткою з 3+ фото. Наведи курсор — одразу перше фото; далі кожні ~3 с плавний crossfade (~300ms). Після зняття курсора — знову перше фото без таймера.
result: pass

### 2. Mobile static card (CARD-01)
expected: На mobile (<768px) лише перше зображення; немає автопрокрутки.
result: pass

### 3. Reduced motion (CARD-01)
expected: З «Зменшити рух» у OS — статичне перше фото, без ротації на hover.
result: pass

### 4. Lightbox partial drag snap (PDP-05)
expected: На PDP з кількома фото відкрий lightbox, частково перетягни слайд (~30–50%) і відпусти — мʼякий snap до найbлижчого слайду без jerk.
result: pass

### 5. Lightbox reopen without jump (PDP-05)
expected: Закрий lightbox і знову відкрий з того ж thumbnail — немає видимого стрибка.
result: pass

### 6. In-cart row copy (PDP-06)
expected: Після додавання в кошик — «Вже в кошику» (disabled) + icon trash; немає «Перейти до кошика» в AddToCartButton.
result: pass

### 7. PDP cart FAB stack (PDP-06)
expected: При count ≥ 1 — FAB з ShoppingCart, badge (9+ при >9), тап на /koszyk; FAB над ChatFab.
result: pass

### 8. Guest FAB badge sync (PDP-06)
expected: Гість: додай/прибери товар — badge FAB оновлюється без full reload.
result: pass

### 9. Session FAB badge sync (PDP-06)
expected: Залогінений: після add/remove FAB показує актуальний count.
result: pass

### 10. Chat regression (PDP-06)
expected: OpenChatButton на PDP і глобальний ChatFab працюють як раніше.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
