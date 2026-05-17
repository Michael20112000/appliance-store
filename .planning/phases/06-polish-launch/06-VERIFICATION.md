# Phase 6 — Manual verification gate (preview → production)

> **D-06-08:** Lighthouse CI не використовується на v1 — лише ручний mobile lab gate.  
> **D-06-12:** Google Search Console — post-launch, поза scope цієї фази.

> **⚠ Ship gate:** Lab на `next dev` **не** приймається для promote. Авторитетний прогін — **Vercel preview** або `npm run build && npm run start` (production bundle).

## Preview deployment URL

**Base URL (Vercel preview, D-06-13):** `https://<vercel-preview-host>`

**Production origin (post-promote):** `https://<production-host>`

---

## Local production build sanity (optional pre-push)

| Check | Result | Date |
|-------|--------|------|
| `npm run build` | ☑ OK | 2026-05-17 |
| `curl` home 200 on `npm run start` | ☑ 200 | 2026-05-17 |

Команди: `npm run build && npm run start` → Lighthouse mobile на `http://localhost:3000` для трьох URL нижче. **CWV pass/fail для ship** — лише після запису preview lab (06-07).

---

## Mobile Lighthouse (lab, D-06-06 / D-06-07)

**Інструмент:** Chrome DevTools → Lighthouse → **Mobile** на **Vercel preview** (production build).  
**Цілі v1:** LCP ≤ **2.5s** · CLS ≤ **0.1** · INP ≤ **200ms**

| URL | LCP | CLS | INP | Pass/Fail |
|-----|-----|-----|-----|-----------|
| `/` (головна) | | | | ☐ |
| `/katalog` | | | | ☐ |
| PDP seed: `/tovar/bosch-kholodylnyky-8-available` | | | | ☐ |

**Обраний PDP slug:** `bosch-kholodylnyky-8-available`

**Дата прогону (preview):** _pending 06-07_

<details>
<summary>Dev lab (invalid for ship) — localhost `next dev`, 2026-05-17</summary>

| URL | LCP | CLS | INP | Pass/Fail |
|-----|-----|-----|-----|-----------|
| `/` | 8.74s | 0.000 | n/a | Fail |
| `/katalog` | 8.13s | 0.171 | n/a | Fail |
| PDP | 8.41s | 0.171 | n/a | Fail |

</details>

---

## Rich Results (D-06-11, SEO-02)

Тест: [Google Rich Results Test](https://search.google.com/test/rich-results) на **public preview** URL.

| Сторінка | URL (preview) | LocalBusiness / Product | Pass/Fail |
|----------|---------------|---------------------------|-----------|
| Головна — LocalBusiness, Львів | `https://<preview>/` | | ☐ |
| PDP — Product + UsedCondition | `https://<preview>/tovar/bosch-kholodylnyky-8-available` | | ☐ |

**Примітки:** `catalog-seo.spec.ts` (localhost) — green; Rich Results на preview — 06-07 Task 3.

---

## robots.txt (preview)

URL: `https://<preview>/robots.txt`

| Перевірка | OK? |
|-----------|-----|
| Рядок `Sitemap:` присутній | ☐ |
| `Disallow: /admin` (або еквівалент) | ☐ |
| Публічний каталог не заблокований | ☐ |

---

## Автоматичний SEO (CI / локально)

```bash
npx playwright test e2e/catalog-seo.spec.ts
```

**Останній прогін:** 2026-05-17 · 6 passed

---

## Code review — PERF-01 / D-06-09

**06-04:** Pass. **06-06 gap fixes:** single Geist stack, deferred chat chrome, catalog card `min-h-48` for CLS.

---

## Perf remediation (D-06-07)

- [x] 06-06: duplicate font removed; chat lazy-loaded; catalog thumbnail layout stability
- [ ] Preview mobile lab pass (06-07) — record scores above

---

## Sign-off

| Gate | Готово до prod promote? |
|------|-------------------------|
| Lighthouse 3 URL (preview) | ☐ |
| Rich Results (preview) | ☐ |
| robots.txt preview | ☐ |
| Production smoke 4/4 (06-08) | ☐ |

**Підпис / дата оператора:** _pending 06-07/08_
