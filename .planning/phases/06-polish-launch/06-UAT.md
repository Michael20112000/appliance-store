---
status: testing
phase: 06-polish-launch
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md, 06-05-SUMMARY.md, 06-06-SUMMARY.md, 06-07-SUMMARY.md
started: 2026-05-17T18:00:00Z
updated: 2026-05-17T17:00:00Z
---

## Current Test

number: 1
name: Купівельний шлях (каталог → кошик → checkout → кабінет)
expected: |
  На preview або production: зареєструйся → каталог → додай товар → після додавання бачиш «У кошику» + «Прибрати з кошика» (не можна спамити «Додати») → checkout → замовлення в /kabinet.
awaiting: user response (re-test after fix)

## Tests

### 1. Купівельний шлях (каталог → кошик → checkout → кабінет)
expected: Зареєстрований покупець проходить повний шлях від каталогу до замовлення в кабінеті без помилок.
result: issue
reported: "Після додавання кнопка «Додати в кошик» не зникає, можна натискати багато разів. Потрібен стан «вже в кошику» і прибрати з кошика."
severity: major

### 2. SEO та crawlers (robots, sitemap, українська)
expected: GET /robots.txt — 200, є посилання на sitemap, disallow /admin. GET /sitemap.xml — 200, є URL товарів. Сторінки каталогу/товару українською (lang=uk).
result: [pending]

### 3. Mobile performance (3 URL)
expected: На телефоні (або DevTools mobile): /, /katalog, один PDP завантажуються без сильних стрибків верстки; LCP відчувається прийнятним (ціль ≤2.5s lab — якщо повільно, зафіксуй).
result: [pending]

### 4. Deploy smoke (публічні маршрути)
expected: На live preview/prod: головна відкривається, /katalog/kholodylnyky (або інша категорія) з посиланням на товар, robots.txt і sitemap.xml відповідають 200.
result: [pending]

### 5. Адмін-доступ
expected: Вхід адміна → /admin відкривається, базові розділи (товари/замовлення) доступні без 403.
result: issue
reported: "CLOUDINARY_API_KEY є на проді, але при створенні товару: «Завантаження фото недоступне: додайте NEXT_PUBLIC_CLOUDINARY_API_KEY або CLOUDINARY_API_KEY»."
severity: major

### 6. Чат (віджет)
expected: FAB чату → відкрити панель → надіслати повідомлення → воно з’являється в треді; для адміна — повідомлення видно в /admin/chaty (якщо є Pusher на середовищі).
result: [pending]

## Summary

total: 6
passed: 0
issues: 2
pending: 4
skipped: 0
blocked: 0

## Gaps

- truth: "Після додавання в кошик PDP показує стан «у кошику» і не дозволяє повторно додати без видалення"
  status: failed
  reason: "User reported: кнопка «Додати в кошик» не зникає, можна натискати багато разів"
  severity: major
  test: 1
  root_cause: "AddToCartButton не отримував inCart з сервера і не мав remove flow"
  artifacts:
    - path: src/components/cart/add-to-cart-button.tsx
      issue: "no in-cart state"
  missing:
    - "initialInCart з isProductInCart + UI «У кошику» / «Прибрати з кошика»"
  debug_session: ""

- truth: "Адмін може завантажувати фото товару на production з CLOUDINARY_API_KEY без NEXT_PUBLIC_ дубля"
  status: failed
  reason: "User reported: помилка про NEXT_PUBLIC_CLOUDINARY_API_KEY хоча CLOUDINARY_API_KEY на проді"
  severity: major
  test: 5
  root_cause: "isUploadWidgetConfigured() читав CLOUDINARY_API_KEY на клієнті — на Vercel він недоступний (лише NEXT_PUBLIC_*)"
  artifacts:
    - path: src/components/admin/product-image-upload.tsx
      issue: "client check for server-only env"
  missing:
    - "перевіряти лише NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; підпис через /api/upload/sign"
  debug_session: ""
