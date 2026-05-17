---
status: complete
phase: 06-polish-launch
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md, 06-05-SUMMARY.md, 06-06-SUMMARY.md, 06-07-SUMMARY.md
started: 2026-05-17T18:00:00Z
updated: 2026-05-17T21:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Купівельний шлях (каталог → кошик → checkout → кабінет)
expected: Зареєстрований покупець проходить повний шлях від каталогу до замовлення в кабінеті без помилок.
result: pass

### 2. SEO та crawlers (robots, sitemap, українська)
expected: GET /robots.txt — 200, є посилання на sitemap, disallow /admin. GET /sitemap.xml — 200, є URL товарів. Сторінки каталогу/товару українською (lang=uk).
result: pass

### 3. Mobile performance (3 URL)
expected: На телефоні (або DevTools mobile): /, /katalog, один PDP завантажуються без сильних стрибків верстки; LCP відчувається прийнятним (ціль ≤2.5s lab — якщо повільно, зафіксуй).
result: pass
note: "LCP окей"

### 4. Deploy smoke (публічні маршрути)
expected: На live preview/prod: головна відкривається, /katalog/kholodylnyky (або інша категорія) з посиланням на товар, robots.txt і sitemap.xml відповідають 200.
result: pass

### 5. Адмін-доступ
expected: Вхід адміна → /admin відкривається, базові розділи (товари/замовлення) доступні без 403.
result: pass

### 6. Чат (віджет)
expected: FAB чату → відкрити панель → надіслати повідомлення → воно з'являється в треді; для адміна — повідомлення видно в /admin/chaty (якщо є Pusher на середовищі).
result: issue
reported: "чат на мобілі не скролиться"
severity: major

## Summary

total: 6
passed: 5
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "На мобільному повноекранний чат скролиться і має зрозумілу кнопку закриття"
  status: failed
  reason: "User reported: чат на мобілі не скролиться"
  severity: major
  test: 6
  root_cause: "Mobile Sheet (85dvh) — PanelBody без flex-контейнера min-h-0; ScrollArea з flex-1 не отримує обмежену висоту на touch, viewport не скролиться"
  artifacts:
    - path: src/components/chat/chat-panel.tsx
      issue: "PanelBody fragment, Sheet flex chain incomplete"
    - path: src/components/chat/message-list.tsx
      issue: "ScrollArea flex-1 без overflow-y-auto fallback на mobile"
  missing:
    - "Обгорнути PanelBody у flex min-h-0 flex-1 flex-col overflow-hidden"
    - "На mobile: overflow-y-auto overscroll-contain на списку повідомлень (або h-0 flex-1 на ScrollArea)"
    - "Переконатись що Sheet showCloseButton видно (не перекриває header)"
  debug_session: ".planning/debug/mobile-chat-scroll.md"
