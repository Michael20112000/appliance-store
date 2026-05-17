# Phase 6: Polish & Launch - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Застосунок **готовий до production launch** на Vercel: ключові flows перевірені E2E, mobile performance і local SEO пройшли gate, production env повний, post-deploy smoke зелений. Це **hardening і верифікація** існуючих фаз 1–5 — не нові продуктові можливості.

**Не в цій фазі:** онлайн-оплата, push/email, wishlist, Meilisearch, legal-сторінки як юридичний пакет, Sentry/APM, Lighthouse CI pipeline, GSC onboarding, доставка поза Львовом.

</domain>

<decisions>
## Implementation Decisions

### E2E gate (area 1)
- **D-06-01:** Phase gate = `npm test && npm run test:e2e` — проходить **весь** каталог `e2e/` (не лише `smoke-deploy`).
- **D-06-02:** Зберегти **окремі spec-файли** за доменом (auth, catalog, cart, admin, chat) — не зливати все в один монолітний тест.
- **D-06-03:** Додати **`e2e/critical-journey.spec.ts`**: один авторизований happy-path — browse catalog (або PDP) → add to cart → checkout → підтвердження замовлення з унікальним маркером. Без admin/chat у тому ж файлі (вони вже покриті окремими спеками).
- **D-06-04:** `e2e/chat-realtime.spec.ts` лишається **optional** — `test.skip(!hasPusherSecrets())`. Auth, persistence, widget, admin-chat — **required**.
- **D-06-05:** Admin upload E2E з Cloudinary — skip без `hasCloudinarySecrets()` (як Phase 4); не блокувати CI без секретів.

### Performance / CWV (area 2)
- **D-06-06:** **Mobile lab Lighthouse** (Chrome DevTools або PageSpeed) на 3 URL перед production promote: `/`, `/katalog`, один seed PDP (`/tovar/[slug]` з prisma seed).
- **D-06-07:** Цілі v1 (lab, mobile): **LCP ≤ 2.5s**, **CLS ≤ 0.1**, **INP ≤ 200ms** на цих трьох сторінках. Не досягли — planner фіксує perf task (images, query, cache), не «ship anyway» без запису в VERIFICATION.
- **D-06-08:** **Без Lighthouse CI** і без нового SaaS (Speedcurve тощо) на v1 — ручний gate + фіксація скорів у `06-VERIFICATION.md`.
- **D-06-09:** Perf pass у коді: перевірити `OptimizedImage` / `CldImage` (`f_auto`, `q_auto`, `sizes`, PDP `priority`) на catalog і PDP; Prisma catalog queries без N+1 (див. PITFALLS §Performance).

### SEO verification (area 3)
- **D-06-10:** **Автоматично:** посилити `e2e/catalog-seo.spec.ts` — `<html lang="uk">`, наявність JSON-LD на PDP, `GET /sitemap.xml` 200, приклад URL з sitemap відповідає 200, **sold slug не в sitemap** (seed/fixture).
- **D-06-11:** **Вручну перед prod:** Rich Results Test — головна (LocalBusiness, Львів) + один PDP (Product + `UsedCondition`); перегляд `robots.txt` якщо є.
- **D-06-12:** **GSC / Search Console** — post-launch, поза scope фази (owner після deploy).
- **D-06-13:** SEO gate на **preview deployment** перед promote на production (той самий checklist).

### Production deploy & smoke (area 4)
- **D-06-14:** **Env checklist** (документ у плані або `06-ENV-CHECKLIST.md`): обовʼязкові на prod — `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_*`, `NEXT_PUBLIC_APP_URL`, Cloudinary trio, Pusher шість змінних; **не** `ADMIN_PASSWORD` seed на prod (окремий admin уже в БД).
- **D-06-15:** `NEXT_PUBLIC_APP_URL` і `BETTER_AUTH_URL` = **production origin** (https, без trailing slash mismatch).
- **D-06-16:** Promote flow: **preview green** (CI/local tests) → manual Lighthouse + SEO checklist → **production deploy** → production smoke.
- **D-06-17:** Post-deploy smoke: `PLAYWRIGHT_BASE_URL=https://<prod> npx playwright test e2e/smoke-deploy.spec.ts` плюс розширений smoke (planner: home + `/katalog` + `/robots.txt` або `sitemap.xml` у тому ж файлі).
- **D-06-18:** `.env.example` доповнити секцією **Production** з коментарями що заборонено/обовʼязково.

### Launch cut line (area 5)
- **D-06-19:** **Ship blockers:** E2E gate (D-06-01), env checklist, manual perf (D-06-06–07), SEO auto + manual (D-06-10–11), production smoke (D-06-17).
- **D-06-20:** **Ship anyway / defer:** Sentry або інший APM, privacy/regulamin legal pages, email/SMS (NOTF-01), Lighthouse CI, GSC setup, analytics beyond базового Vercel Analytics (якщо не підключено — не блокує).
- **D-06-21:** **Launch mode:** публічний каталог і checkout — **не** friends-only beta; достатньо «мʼякого» анонсу для локального магазину.
- **D-06-22:** Якщо `robots.txt` відсутній або не посилається на sitemap — додати мінімальний `app/robots.ts` у scope polish.

### CI / PR gate (area 6)
- **D-06-23:** Додати **`.github/workflows/ci.yml`**: на `pull_request` і `push` до `main` — `npm ci`, `npm run lint`, `npm test`, `npx playwright test` з `webServer` (localhost), без production secrets.
- **D-06-24:** CI **не падає** через skipped optional specs (Pusher realtime, Cloudinary upload); required specs мають бути зелені.
- **D-06-25:** **Без** E2E проти Vercel preview URL у CI v1 — preview smoke лишається **manual** після deploy; CI = localhost only.
- **D-06-26:** `forbidOnly` у Playwright уже враховує CI — зберегти.

### Claude's Discretion
Користувач делегував усі 6 зон («на твій розсуд»); рішення зафіксовані в D-06-01…D-06-26. Planner може розбити на 3–5 планів (CI, E2E journey, SEO/perf verify, deploy docs, smoke) без зміни цих locks.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — core value, quality bar (design + SEO + performance)
- `.planning/REQUIREMENTS.md` — SEO-01/02, PERF-01, cross-cutting quality
- `.planning/ROADMAP.md` — Phase 6 success criteria
- `.planning/STATE.md` — accumulated decisions

### Prior phases
- `.planning/phases/05-realtime-chat/05-CONTEXT.md` — Pusher optional E2E pattern
- `.planning/phases/04-admin-operations/04-CONTEXT.md` — Cloudinary sign, admin RBAC
- `.planning/phases/02-catalog-discovery/02-UI-SPEC.md` — OptimizedImage / LCP PDP
- `.planning/phases/01-foundation-auth-design-system/SKELETON.md` — Phase 6 intent (E2E, CWV, hardening)

### Research & pitfalls
- `.planning/research/PITFALLS.md` — Performance traps, «Looks done but isn't» SEO checklist
- `.planning/research/ARCHITECTURE.md` — Phase 9 performance pass reference
- `.planning/research/STACK.md` — CldImage, caching notes

### Code & config
- `playwright.config.ts` — CI retries, `PLAYWRIGHT_BASE_URL`, webServer
- `e2e/helpers/pusher.ts`, `e2e/helpers/admin.ts` — secret gates
- `e2e/catalog-seo.spec.ts`, `e2e/smoke-deploy.spec.ts` — extend in this phase
- `.env.example` — production env documentation target
- `vercel.json` — minimal Vercel config
- `src/app/sitemap.ts` — sitemap generation (sold exclusion via service)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `e2e/*.spec.ts` (23 files) — domain coverage; extend, don't rewrite
- `e2e/global-setup.js` — auth/seed for Playwright
- `e2e/checkout.spec.ts`, `e2e/cart-auth.spec.ts` — patterns for critical-journey
- `src/app/sitemap.ts` + `listPublicProductSlugsForSitemap` — SEO automation hook
- `src/components/media/optimized-image.tsx` — PERF-01 surface
- `getEnv()` — `NEXT_PUBLIC_APP_URL` for sitemap and auth

### Established Patterns
- Optional E2E when third-party secrets missing (`hasPusherSecrets`, `hasCloudinarySecrets`)
- Vitest for services; Playwright for user flows
- Vercel + Neon from Phase 1; no Docker local DB

### Integration Points
- New: `.github/workflows/ci.yml`
- Extend: `e2e/smoke-deploy.spec.ts`, `e2e/catalog-seo.spec.ts`, new `e2e/critical-journey.spec.ts`
- Docs: `.env.example` production section; optional `06-ENV-CHECKLIST.md` in phase dir
- Optional: `src/app/robots.ts` if missing

</code_context>

<specifics>
## Specific Ideas

- Користувач повністю делегував рішення по всіх 6 gray areas — пріоритет: **практичний MVP launch** для одного магазину у Львові, без enterprise observability.
- Зберегти існуючі optional-skip патерни для CI без секретів.

</specifics>

<deferred>
## Deferred Ideas

- **Sentry / error tracking** — post-MVP; не блокує launch (D-06-20)
- **Legal pages** (privacy, offer) — v2 або owner content; не в Phase 6
- **Google Search Console** onboarding — після deploy (D-06-12)
- **Lighthouse CI / Speedcurve** — v2 automation (D-06-08)
- **E2E on Vercel preview in CI** — v2; manual preview smoke достатньо (D-06-25)
- **NOTF-01** email/SMS — v2 requirements

</deferred>

---

*Phase: 06-Polish & Launch*
*Context gathered: 2026-05-17*
