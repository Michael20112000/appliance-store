# Phase 6 — Manual verification gate (preview → production)

> **D-06-08:** Lighthouse CI не використовується на v1 — лише ручний mobile lab gate.  
> **D-06-12:** Google Search Console — post-launch, поза scope цієї фази.

> **⚠ Ship gate:** Lab на `next dev` **не** приймається для promote. Авторитетний прогін — **Vercel preview** або `npm run build && npm run start` (production bundle).

## Preview deployment URL

**Base URL (Vercel preview, D-06-13):** `https://project-r4qzr.vercel.app`

**Deploy:** `498b492` (main) · Vercel deployment `project-r4qzr-6axoptgp4-michael20112000s-projects.vercel.app` (401 without auth — use canonical domain above)

**Production origin (post-promote):** `https://<production-host>`

---

## Local production build sanity (optional pre-push)

| Check | Result | Date |
|-------|--------|------|
| `npm run build` | ☑ OK | 2026-05-17 |
| `curl` home 200 on `npm run start` | ☑ 200 | 2026-05-17 |

---

## Mobile Lighthouse (lab, D-06-06 / D-06-07)

**Інструмент:** Lighthouse CLI 12.6.1 — **Mobile** на `https://project-r4qzr.vercel.app` (production build on Vercel).  
**Цілі v1:** LCP ≤ **2.5s** · CLS ≤ **0.1** · INP ≤ **200ms**

| URL | LCP | CLS | INP | Pass/Fail |
|-----|-----|-----|-----|-----------|
| `/` (головна) | 3.68s | 0.000 | n/a | ☑ **Fail** (LCP) |
| `/katalog` | 3.05s | 0.171 | n/a | ☑ **Fail** (LCP + CLS) |
| PDP seed: `/tovar/bosch-kholodylnyky-8-available` | 3.17s | 0.000 | n/a | ☑ **Fail** (LCP) |

**Обраний PDP slug:** `bosch-kholodylnyky-8-available`

**Дата прогону (preview):** 2026-05-17

**Висновок (D-06-07):** CWV targets **not met** on preview. **Promote to production blocked** until LCP ≤2.5s and CLS ≤0.1 on all three URLs (or documented override with measured pass).

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
| Головна — LocalBusiness, Львів | `https://project-r4qzr.vercel.app/` | `addressLocality` Львів у HTML (automated curl) | ☑ Pass (pending Google tool) |
| PDP — Product + UsedCondition | `https://project-r4qzr.vercel.app/tovar/bosch-kholodylnyky-8-available` | `UsedCondition` у markup | ☑ Pass (pending Google tool) |

**Примітки:** `catalog-seo.spec.ts` — green. Рекомендовано підтвердити в Rich Results Test перед prod promote.

---

## robots.txt (preview)

URL: `https://project-r4qzr.vercel.app/robots.txt`

| Перевірка | OK? |
|-----------|-----|
| Рядок `Sitemap:` присутній | ☑ |
| `Disallow: /admin` (або еквівалент) | ☑ |
| Публічний каталог не заблокований | ☑ |

---

## Preview smoke (automated)

```bash
PLAYWRIGHT_BASE_URL=https://project-r4qzr.vercel.app npx playwright test e2e/smoke-deploy.spec.ts
```

**2026-05-17:** ☑ **4/4 passed**

---

## Автоматичний SEO (CI / локально)

```bash
npx playwright test e2e/catalog-seo.spec.ts
```

**Останній прогін:** 2026-05-17 · 6 passed

---

## Code review — PERF-01 / D-06-09

**06-04:** Pass. **06-06:** single Geist, deferred chat, catalog `min-h-48`.

---

## Perf remediation (D-06-07)

- [x] 06-06: duplicate font, chat deferral, catalog min-height
- [ ] Preview LCP still >2.5s on all three URLs (3.05–3.68s)
- [ ] `/katalog` CLS 0.171 — needs layout fix (grid images/fonts)

**Next perf ideas:** hero image preload, reduce JS on catalog route, fix catalog CLS (skeleton or fixed aspect on all cards), consider `next/font` subsetting audit.

---

## Sign-off

| Gate | Готово до prod promote? |
|------|-------------------------|
| Lighthouse 3 URL (preview) | ☑ **Fail** — blocked |
| Rich Results (preview) | ☑ Pass (markup; Google tool optional) |
| robots.txt preview | ☑ Pass |
| Preview smoke 4/4 | ☑ Pass |
| Production smoke 4/4 (06-08) | ☐ Blocked until Lighthouse pass |

**Підпис / дата оператора:** Michael Ivashko · 2026-05-17 · **preview recorded; promote blocked (CWV)**
