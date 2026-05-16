# Phase 1: Foundation, Auth & Design System - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Стартовий вертикальний зріз: застосунок збирається, деплоїться, має український «повітряний» UI-shell, публічні сторінки без логіну, робочу реєстрацію/вхід email+пароль із збереженням сесії, роль `admin` (seed), і єдиний компонент оптимізованих зображень Cloudinary.

**Не в цій фазі:** каталог товарів, фільтри, кошик, checkout, CRUD адмінки, realtime-чат.
</domain>

<decisions>
## Implementation Decisions

### Visual identity (легкий, повітряний)
- **D-01:** Тільки **світла тема** на v1 — багато whitespace, м’які нейтралі (slate/zinc 50–100), один акцент (наприклад, `oklch` блакитний/teal для CTA).
- **D-02:** **shadcn/ui** стиль `new-york`, Tailwind v4 `@theme` токени в `globals.css` (radius великий, тіні легкі).
- **D-03:** Шрифт **Geist Sans** (або Inter fallback) — читабельність UA тексту, розмір body ≥ 16px на mobile.
- **D-04:** Без dark mode до окремого запиту.

### Auth (Better Auth)
- **D-05:** Лише **email + пароль** (без OAuth / magic link на v1).
- **D-06:** Реєстрація **відкрита** для покупців (`role: buyer`).
- **D-07:** **Перший admin** — через `prisma db seed` + env `ADMIN_EMAIL` / `ADMIN_PASSWORD`; публічна реєстрація **не** може отримати `admin`.
- **D-08:** Better Auth **admin plugin** + `prismaAdapter`; сесія в cookie, persist після refresh (AUTH-05).
- **D-09:** Сторінки: `/uviity` (login), `/reiestratsiia` (sign-up), `/kabinet` (заглушка кабінету після входу).

### App shell & routing
- **D-10:** Route groups: `app/(storefront)/` і `app/(admin)/admin/` — різні layout.
- **D-11:** **Головна Phase 1:** hero (Львів, б/у техніка) + сітка **8 категорій** (seed, без PDP) + блок «Як купити» + footer з контактами-заглушками.
- **D-12:** Header: лого, посилання на категорії (ведуть на `/katalog/[slug]` — сторінки-заглушки «незабаром» або 404 з м’яким текстом до Phase 2).
- **D-13:** Middleware: `/admin/*` → redirect якщо не admin; публічні маршрути без auth.

### Cloudinary (PERF-01)
- **D-14:** Phase 1: **delivery only** — `next-cloudinary` `CldImage` wrapper (`f_auto`, `q_auto`, responsive sizes); env `CLOUDINARY_*`.
- **D-15:** Демо-зображення на головній (1–2 з Cloudinary demo або завантажені вручну в cloud).
- **D-16:** **Signed upload у адмінці** — Phase 4 (не зараз).

### Infrastructure
- **D-17:** Production DB: **Neon Postgres**, region **EU** (`eu-central-1` або найближчий EU).
- **D-18:** Local dev: `docker compose` Postgres **або** Neon dev branch — обрати один шлях у PLAN (рекомендація: Neon branch для parity).
- **D-19:** Seed Phase 1: **8 категорій** (назви з PROJECT.md) + **1 admin user**; без товарів.
- **D-20:** Deploy target: **Vercel** + env у preview/production з першого PR.

### Claude's Discretion
- Точні OKLCH значення акценту, copy на головній, структура `prisma/schema` для User/Category (мінімум для auth + seed).
- Вибір між Docker Postgres vs Neon-only для local — за parity з Vercel.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & phase scope
- `.planning/PROJECT.md` — бізнес-модель, core value, out of scope
- `.planning/REQUIREMENTS.md` — AUTH-01, AUTH-02, AUTH-05, UI-01–03, PERF-01
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, **UI hint: yes**
- `.planning/STATE.md` — поточна позиція

### Research (stack & architecture)
- `.planning/research/STACK.md` — версії Next 16, Prisma 7, Neon, shadcn, Cloudinary, Better Auth
- `.planning/research/ARCHITECTURE.md` — route groups, services layer, auth guards
- `.planning/research/PITFALLS.md` — admin RBAC на server, Cloudinary signed uploads (Phase 4)
- `.planning/research/SUMMARY.md` — build order summary

</canonical_refs>

<code_context>
## Existing Code Insights

Greenfield — коду немає.

### Reusable Assets
- Немає — створюємо з `create-next-app` + shadcn init.

### Established Patterns
- Дотримуватись `.planning/research/ARCHITECTURE.md`: RSC для read, Server Actions для mutate, `server/services` + `lib/auth`.

### Integration Points
- Phase 2 підключить каталог до seed categories і layout storefront.
- Phase 4 підключить Cloudinary upload до admin Product CRUD.

</code_context>

<specifics>
## Specific Ideas

- «Легкий, повітряний» = світлий фон, великі відступи, мінімум візуального шуму, не «важкий» e-commerce з темних блоків.
- Львів у hero/copy для локального відчуття (повний LocalBusiness JSON-LD — Phase 2 SEO).
- Користувач хоче якість: дизайн + SEO + performance — у Phase 1 закласти metadata API, `lang="uk"`, швидкі зображення.

</specifics>

<deferred>
## Deferred Ideas

- OAuth / magic link — v2 або за запитом
- Dark mode
- Повноцінний каталог і PDP — **Phase 2**
- Signed Cloudinary upload UI — **Phase 4**
- Pusher / chat — **Phase 5**
- Юридичні сторінки (оферта, privacy) — можна Phase 6 або окремий polish; не блокує foundation

</deferred>

---

*Phase: 01-Foundation, Auth & Design System*
*Context gathered: 2026-05-16*
