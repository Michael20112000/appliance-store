# Phase 6 — Manual verification gate (preview → production)

> **D-06-08:** Lighthouse CI не використовується на v1 — лише ручний mobile lab gate.  
> **D-06-12:** Google Search Console — post-launch, поза scope цієї фази.

## Preview deployment URL

**Base URL (Vercel preview, D-06-13):** `http://localhost:3000`

**Примітка:** Оператор **approved** checkpoint 2026-05-17. Mobile lab прогнано на **локальному dev** (`next dev`) — не на Vercel preview; LCP завищений через dev bundle. Перед prod promote — повторити Lighthouse на Vercel preview/production. Automated SEO (`catalog-seo.spec.ts`) — green.

---

## Mobile Lighthouse (lab, D-06-06 / D-06-07)

**Інструмент:** Chrome Lighthouse CLI — **Mobile** (localhost dev, 2026-05-17).  
**Цілі v1:** LCP ≤ **2.5s** · CLS ≤ **0.1** · INP ≤ **200ms**

| URL | LCP | CLS | INP | Pass/Fail |
|-----|-----|-----|-----|-----------|
| `/` (головна) | 8.74s | 0.000 | n/a | ☑ Fail |
| `/katalog` | 8.13s | 0.171 | n/a | ☑ Fail |
| PDP seed: `/tovar/bosch-kholodylnyky-8-available` | 8.41s | 0.171 | n/a | ☑ Fail |

**Обраний PDP slug:** `bosch-kholodylnyky-8-available` _(перший AVAILABLE з `/katalog/kholodylnyky`)_

**Дата прогону:** 2026-05-17

---

## Rich Results (D-06-11, SEO-02)

Тест: [Google Rich Results Test](https://search.google.com/test/rich-results) — **deferred** на Vercel preview URL.

| Сторінка | URL (preview) | LocalBusiness / Product | Pass/Fail |
|----------|---------------|---------------------------|-----------|
| Головна — LocalBusiness, Львів | `http://localhost:3000/` | LocalBusiness + `addressLocality: Львів` (JSON-LD у коді) | ☑ Pass (operator + automated JSON-LD) |
| PDP — Product + UsedCondition | `http://localhost:3000/tovar/bosch-kholodylnyky-8-available` | Product, `itemCondition` UsedCondition (`catalog-seo` e2e) | ☑ Pass (operator + e2e) |

**Примітки:** Playwright `catalog-seo.spec.ts` підтверджує `UsedCondition|RefurbishedCondition` у JSON-LD. Rich Results Test на публічному preview — перед prod promote (06-ENV-CHECKLIST).

---

## robots.txt (preview, після 06-03)

URL: `http://localhost:3000/robots.txt`

| Перевірка | OK? |
|-----------|-----|
| Рядок `Sitemap:` присутній | ☑ |
| `Disallow: /admin` (або еквівалент) | ☑ |
| Публічний каталог не заблокований | ☑ |

---

## Автоматичний SEO (вже в CI / локально)

```bash
npx playwright test e2e/catalog-seo.spec.ts
```

Очікування: `lang="uk"`, JSON-LD на PDP, `GET /sitemap.xml` 200, sold slug не в sitemap (D-06-10).

**Останній прогін:** 2026-05-17 · результат: ☑ green (6 passed)

---

## Code review — PERF-01 / D-06-09

**Дата аудиту:** 2026-05-17 (06-04 Task 2)  
**Результат:** ✅ **Pass** — регресій не знайдено; змін у коді не потрібно.  
**Automated verify:** `format="auto"` + PDP `priority` — green.

| Перевірка | Статус | Деталі |
|-----------|--------|--------|
| `OptimizedImage` — `format="auto"`, `quality="auto"` | ✅ | `src/components/media/optimized-image.tsx` |
| PDP gallery — `priority` + `sizes` | ✅ | `product-gallery.tsx`: `(max-width: 768px) 100vw, 50vw` |
| Catalog card — `sizes` на thumbnails | ✅ | `product-card.tsx`: `(max-width: 768px) 50vw, 25vw` |
| Home hero — `priority` | ✅ | `hero-section.tsx` |
| Catalog list — один `findMany` + `include`, без N+1 | ✅ | `catalog.service.ts` — `cardInclude`, `Promise.all([count, findMany])` |

---

## Perf remediation (якщо CWV fail, D-06-07)

Заповнено — Lighthouse fail на **localhost dev** (не production build).

- [x] Додати/виправити `sizes` на LCP-зображенні — already pass code review
- [x] Переконатися, що PDP / hero мають `priority` — pass
- [x] Перевірити Prisma list query (без per-row fetch) — pass
- [ ] Інше (опис): повторити mobile lab на **Vercel preview** після `next build` deploy

**Deferral (якщо свідомо відкладаємо):** CWV targets not met on localhost dev lab; operator approved proceed to deploy smoke (06-05). Re-verify LCP/CLS on preview/production before final promote (D-06-16).

---

## Sign-off

| Gate | Готово до prod promote? |
|------|-------------------------|
| Lighthouse 3 URL (D-06-06–07) | ☑ (recorded; defer re-run on preview) |
| Rich Results (D-06-11) | ☑ (e2e + operator; Google tool on preview pending) |
| robots.txt preview | ☑ |
| Code review D-06-09 | ☑ (pass без змін) |

**Підпис / дата оператора:** Michael Ivashko · 2026-05-17 · **approved**
