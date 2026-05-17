# Phase 6 — Manual verification gate (preview → production)

> **D-06-08:** Lighthouse CI не використовується на v1 — лише ручний mobile lab gate.  
> **D-06-12:** Google Search Console — post-launch, поза scope цієї фази.

## Preview deployment URL

**Base URL (Vercel preview, D-06-13):** `https://___`

Заповнити перед promote на production. Не вставляти тестові credentials у цей файл.

---

## Mobile Lighthouse (lab, D-06-06 / D-06-07)

**Інструмент:** Chrome DevTools → Lighthouse → **Mobile** (або PageSpeed Insights, mobile).  
**Цілі v1:** LCP ≤ **2.5s** · CLS ≤ **0.1** · INP ≤ **200ms**

| URL | LCP | CLS | INP | Pass/Fail |
|-----|-----|-----|-----|-----------|
| `/` (головна) | ___ | ___ | ___ | ☐ Pass ☐ Fail |
| `/katalog` | ___ | ___ | ___ | ☐ Pass ☐ Fail |
| PDP seed: `/tovar/___` | ___ | ___ | ___ | ☐ Pass ☐ Fail |

**Обраний PDP slug:** ___ _(перший AVAILABLE з каталогу або prisma seed)_

**Дата прогону:** ___

---

## Rich Results (D-06-11, SEO-02)

Тест: [Google Rich Results Test](https://search.google.com/test/rich-results) на **preview** URL.

| Сторінка | URL (preview) | LocalBusiness / Product | Pass/Fail |
|----------|---------------|---------------------------|-----------|
| Головна — LocalBusiness, Львів | `https://___/` | LocalBusiness + `addressLocality: Львів` | ☐ Pass ☐ Fail |
| PDP — Product + UsedCondition | `https://___/tovar/___` | Product, `itemCondition` UsedCondition | ☐ Pass ☐ Fail |

**Примітки:** ___

---

## robots.txt (preview, після 06-03)

URL: `https://___/robots.txt`

| Перевірка | OK? |
|-----------|-----|
| Рядок `Sitemap:` присутній | ☐ |
| `Disallow: /admin` (або еквівалент) | ☐ |
| Публічний каталог не заблокований | ☐ |

---

## Автоматичний SEO (вже в CI / локально)

```bash
npx playwright test e2e/catalog-seo.spec.ts
```

Очікування: `lang="uk"`, JSON-LD на PDP, `GET /sitemap.xml` 200, sold slug не в sitemap (D-06-10).

**Останній прогін (опційно):** ___ · результат: ☐ green ☐ red

---

## Code review — PERF-01 / D-06-09

**Дата аудиту:** 2026-05-17  
**Результат:** ✅ **Pass** — регресій не знайдено; змін у коді не потрібно.

| Перевірка | Статус | Деталі |
|-----------|--------|--------|
| `OptimizedImage` — `format="auto"`, `quality="auto"` | ✅ | `src/components/media/optimized-image.tsx` |
| PDP gallery — `priority` + `sizes` | ✅ | `product-gallery.tsx`: `(max-width: 768px) 100vw, 50vw` |
| Catalog card — `sizes` на thumbnails | ✅ | `product-card.tsx`: `(max-width: 768px) 50vw, 25vw` |
| Home hero — `priority` | ✅ | `hero-section.tsx` |
| Catalog list — один `findMany` + `include`, без N+1 | ✅ | `catalog.service.ts` — `cardInclude`, `Promise.all([count, findMany])` |

---

## Perf remediation (якщо CWV fail, D-06-07)

Заповнювати лише якщо хоча б один рядок Lighthouse = **Fail**. Не promote на prod без запису скорів або явного deferral.

- [ ] Додати/виправити `sizes` на LCP-зображенні
- [ ] Переконатися, що PDP / hero мають `priority`
- [ ] Перевірити Prisma list query (без per-row fetch)
- [ ] Інше (опис): ___

**Deferral (якщо свідомо відкладаємо):** ___

---

## Sign-off

| Gate | Готово до prod promote? |
|------|-------------------------|
| Lighthouse 3 URL (D-06-06–07) | ☐ |
| Rich Results (D-06-11) | ☐ |
| robots.txt preview | ☐ |
| Code review D-06-09 | ☑ (pass без змін) |

**Підпис / дата оператора:** ___
