---
phase: 1
slug: foundation-auth-design-system
status: draft
shadcn_initialized: false
preset: "new-york · base: zinc · cssVariables · Tailwind v4 @theme (init during Phase 1 execution)"
created: 2026-05-16
locale: uk
lang_attr: uk
---

# Phase 1 — UI Design Contract

> Візуальний і interaction-контракт для Foundation, Auth & Design System. Джерела: `01-CONTEXT.md` (D-01..D-04, D-09..D-13), `REQUIREMENTS.md` (UI-01–03, PERF-01), `ROADMAP.md` Phase 1.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (init у Phase 1 — greenfield) |
| Preset | `new-york`, base color `zinc`, `cssVariables: true`, Tailwind v4 |
| Component library | Radix primitives (via shadcn) |
| Icon library | `lucide-react` (shadcn default) |
| Font | **Geist Sans** (`next/font/google` або `geist` package), fallback `Inter, system-ui, sans-serif` |
| Styling | Tailwind CSS **v4** — токени в `app/globals.css` через `@theme` |
| Theme modes | **Light only** (D-04) — без `dark:` варіантів до окремого запиту |
| Document | `<html lang="uk">` на всіх storefront/admin layout |

**Init command (executor):** `npx shadcn@latest init` — style `new-york`, base `zinc`, CSS variables enabled. Після init: `npx shadcn@latest add button card input label form separator skeleton alert badge avatar dropdown-menu navigation-menu sheet`.

---

## Spacing Scale

Усі значення — кратні 4. Використовувати Tailwind-класи або CSS-змінні з `@theme`.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `1` | Іконка↔текст, compact chips |
| sm | 8px | `2` | Внутрішній padding кнопок sm, gap у рядках |
| md | 16px | `4` | Default gap карток, padding input, mobile section padding |
| lg | 24px | `6` | Padding Card, gap сітки категорій |
| xl | 32px | `8` | Section vertical rhythm, desktop container padding |
| 2xl | 48px | `12` | Hero padding-bottom, major section breaks |
| 3xl | 64px | `16` | Hero top/bottom на desktop, footer top margin |

**Exceptions:**

| Exception | Value | Usage |
|-----------|-------|-------|
| Touch target min | 44×44px | Усі клікабельні контроли на mobile (кнопки, nav links, category tiles) |
| Header height | 64px mobile / 72px desktop | Fixed/sticky header |
| Max content width | `max-w-6xl` (72rem / 1152px) | Storefront main column, centered |
| Category grid gap | 16px mobile / 24px desktop | Між плитками категорій |

---

## Typography

Рівно **4 розміри**, **2 ваги** (400, 600). Body **≥16px** на mobile (D-03).

| Role | Size | Weight | Line height | Tailwind (орієнтир) | Usage |
|------|------|--------|-------------|---------------------|-------|
| Body | 16px (mobile), 16px (desktop) | 400 | 1.5 | `text-base font-normal leading-relaxed` | Параграфи, описи, footer |
| Label | 14px | 600 | 1.4 | `text-sm font-semibold leading-snug` | Form labels, nav group titles, badge text |
| Heading | 20px mobile / 24px desktop | 600 | 1.2 | `text-xl md:text-2xl font-semibold leading-tight` | Section titles («Категорії», «Як купити») |
| Display | 28px mobile / 36px desktop | 600 | 1.15 | `text-3xl md:text-4xl font-semibold tracking-tight` | Hero H1 |

**Font stack (globals.css):**

```css
@theme {
  --font-sans: var(--font-geist-sans), "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

**UA readability:** не зменшувати body нижче 16px; у формах error/helper — 14px max для вторинного тексту.

---

## Color

### 60 / 30 / 10 split

| Role | Token / value | ~% | Usage |
|------|---------------|-----|-------|
| Dominant (60%) | `--background: oklch(0.99 0.002 247)` · zinc-50 | Фон сторінки, hero backdrop, великі повітряні зони |
| Secondary (30%) | `--card: oklch(1 0 0)` · `--muted: oklch(0.96 0.004 247)` · zinc-100 borders | Card, header bar, footer band, category tiles, form surfaces |
| Accent (10%) | `--primary: oklch(0.55 0.14 220)` (blue-teal) | **Тільки** елементи з таблиці нижче |
| Destructive | `--destructive: oklch(0.55 0.22 25)` | Помилки валідації, destructive confirm (Phase 1 — мінімально) |

### shadcn semantic mapping (`globals.css` @theme)

```css
@theme inline {
  --radius: 0.75rem; /* 12px — "large radius" D-02 */

  --background: oklch(0.99 0.002 247);
  --foreground: oklch(0.25 0.02 247);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.25 0.02 247);

  --muted: oklch(0.96 0.004 247);
  --muted-foreground: oklch(0.45 0.02 247);

  --border: oklch(0.92 0.006 247);
  --input: oklch(0.92 0.006 247);

  --primary: oklch(0.55 0.14 220);
  --primary-foreground: oklch(0.99 0 0);

  --secondary: oklch(0.96 0.004 247);
  --secondary-foreground: oklch(0.30 0.02 247);

  --accent: oklch(0.96 0.02 220);
  --accent-foreground: oklch(0.35 0.08 220);

  --destructive: oklch(0.55 0.22 25);
  --ring: oklch(0.55 0.14 220);

  --shadow-sm: 0 1px 2px oklch(0.25 0.02 247 / 0.06);
  --shadow-md: 0 4px 12px oklch(0.25 0.02 247 / 0.08);
}
```

### Accent reserved for (ніколи «все інтерактивне»)

1. Primary CTA buttons (`variant="default"`) — hero, auth submit, category «Переглянути каталог» (якщо accent)
2. Focus ring (`--ring`) на keyboard focus
3. Active nav link underline або text color (один стиль на вибір executor)
4. Посилання «Увійти» / «Зареєструватися» у header (text-primary, не ghost для entry points)

**НЕ accent:** body text, card borders, category tile backgrounds (secondary/muted), footer links (foreground/muted-foreground), secondary buttons (`variant="outline"` / `secondary`).

### Shadows (D-02 light)

| Token | Value | Usage |
|-------|-------|-------|
| Card default | `shadow-sm` | Category cards, auth card |
| Card hover | `shadow-md` + `translate-y-[-1px]` | Category tile hover (desktop only, `motion-reduce:transform-none`) |
| Header | `border-b` only, без важкої тіні | Sticky header |

---

## Component Inventory (Phase 1)

| Component | shadcn | Variants / notes |
|-----------|--------|------------------|
| Button | `button` | `default` (primary CTA), `outline` (secondary), `ghost` (header nav), `link` (inline) |
| Card | `card` | Hero feature card optional; category tile = Card + CardHeader/Title |
| Input | `input` | Email, password; `aria-invalid` + error text |
| Label | `label` | Зв’язка `htmlFor` |
| Form | `form` | react-hook-form + zod; auth pages |
| Alert | `alert` | Auth/API errors (`variant="destructive"`) |
| Separator | `separator` | «Як купити» steps |
| Skeleton | `skeleton` | Optional loading для hero image |
| Badge | `badge` | «Незабаром» на category stub |
| Avatar | `avatar` | Header user menu (post-login) — optional Phase 1 |
| DropdownMenu | `dropdown-menu` | Logged-in: «Кабінет», «Вийти» |
| NavigationMenu / plain nav | — | Header links; mobile → Sheet |
| Sheet | `sheet` | Mobile nav drawer |

### Custom components (Phase 1)

| Component | Path (recommended) | Responsibility |
|-----------|-------------------|----------------|
| `StoreHeader` | `components/layout/store-header.tsx` | Logo, categories, auth |
| `StoreFooter` | `components/layout/store-footer.tsx` | Contacts stub, copyright |
| `CategoryGrid` | `components/home/category-grid.tsx` | 8 tiles from seed |
| `HeroSection` | `components/home/hero-section.tsx` | H1, subcopy, CTA, CldImage |
| `HowToBuy` | `components/home/how-to-buy.tsx` | 3–4 steps |
| `OptimizedImage` | `components/media/optimized-image.tsx` | Wrapper над `CldImage` (PERF-01) |
| `AuthForm` | `components/auth/auth-form.tsx` | Login / sign-up shared layout |

---

## Responsive Breakpoints

Tailwind v4 defaults (mobile-first):

| Breakpoint | Min width | Phase 1 behavior |
|------------|-----------|------------------|
| default | 0 | Single column hero; 2-col category grid; hamburger nav |
| `sm` | 640px | 2-col category grid stable |
| `md` | 768px | Header horizontal nav; 4-col category grid |
| `lg` | 1024px | Hero side-by-side (text + image); max-w-6xl container |
| `xl` | 1280px | Same as lg; extra horizontal padding only |

**Container:** `mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8`

---

## Page Layouts

### Global storefront shell (`app/(storefront)/layout.tsx`)

```
┌─────────────────────────────────────────────┐
│ StoreHeader (sticky, h-16 md:h-18)          │
├─────────────────────────────────────────────┤
│ <main> {children}                           │
├─────────────────────────────────────────────┤
│ StoreFooter                                 │
└─────────────────────────────────────────────┘
```

- Metadata default: `title` шаблон `%s | Техніка б/у Львів` (або бренд з PROJECT)
- `lang="uk"` на `<html>`

---

### Home `/` (D-11)

**Sections (top → bottom):**

1. **Hero** (`HeroSection`)
   - Layout: mobile stack (copy → image); `lg:` row 50/50
   - Display H1: **«Б/у побутова техніка у Львові»**
   - Body: 1–2 речення про перевірену техніку, самовивіз/доставка по Львову (без обіцянок оплати онлайн)
   - Primary CTA: **«Переглянути категорії»** → `#kategorii` або scroll to grid
   - Image: 1× `OptimizedImage` (Cloudinary demo), `priority`, aspect `16/10` or `4/3`
   - Padding: `py-12 md:py-16 lg:py-20`

2. **Categories** (`id="kategorii"`, `CategoryGrid`)
   - Heading: **«Категорії»**
   - Grid: `grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6`
   - 8 карток (seed): Пральні машини, Холодильники, Морозильні камери, Телевізори, Плити, Духові шафи, Варильні поверхні, Сушарки для одягу
   - Кожна картка: назва UA, optional icon (lucide), link → `/katalog/[slug]`
   - Card: `bg-card border rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md`

3. **How to buy** (`HowToBuy`)
   - Heading: **«Як купити»**
   - 3 кроки (horizontal `md:grid-cols-3`):
     1. **«Оберіть техніку»** — перегляньте категорії
     2. **«Оформіть замовлення»** — після входу (Phase 3; copy не обіцяє checkout зараз)
     3. **«Отримайте у Львові»** — самовивіз або доставка
   - Background: `bg-muted/50` full-bleed band, inner `max-w-6xl`

4. **Footer** (`StoreFooter`)
   - Placeholder: «м. Львів», телефон/email заглушки, «© {year} …»
   - Links: головна, каталог (якщо є), увійти

---

### Header (D-12)

| Zone | Content |
|------|---------|
| Logo | Text або wordmark «Техніка Львів» → `/` |
| Nav | 8 category links (скорочені назви на mobile sheet) |
| Auth | Guest: **«Увійти»** → `/uviity`, **«Реєстрація»** → `/reiestratsiia` (outline + primary) |
| Auth logged-in | **«Кабінет»** → `/kabinet`, sign out |

Mobile: logo + menu button → `Sheet` з категоріями + auth.

---

### Login `/uviity` (D-09)

- Centered card `max-w-md`, `py-12`
- Title (Heading): **«Вхід»**
- Fields: email, password
- Submit (primary): **«Увійти»**
- Link: **«Немає облікового запису? Зареєструватися»** → `/reiestratsiia`
- Error Alert: див. Copywriting

---

### Sign-up `/reiestratsiia`

- Same layout as login
- Title: **«Реєстрація»**
- Fields: email, password, confirm password (min 8 chars — helper text UA)
- Submit: **«Створити обліковий запис»**
- Link: **«Вже є обліковий запис? Увійти»**

---

### Cabinet stub `/kabinet`

- Requires session; redirect to `/uviity` if guest
- Heading: **«Особистий кабінет»**
- Body muted: **«Тут з’являться ваші замовлення та чат з магазином — незабаром.»**
- Secondary link: **«На головну»** → `/`

---

### Category stub `/katalog/[slug]`

- Heading: назва категорії з БД
- Badge: **«Незабаром»**
- Body: **«Ми наповнюємо каталог. А поки що перегляньте інші категорії або зв’яжіться з нами.»**
- CTA outline: **«Усі категорії»** → `/#kategorii`
- Optional soft 404: якщо slug невідомий — той самий layout з **«Категорію не знайдено»**

---

### Admin shell `/admin` (minimal, D-13)

- Route group `app/(admin)/admin/layout.tsx` — **окремий** від storefront (без marketing hero)
- Simple sidebar або top bar placeholder: **«Адмін-панель»**
- Body: **«Панель керування — Phase 4»** (доведення middleware RBAC)
- Visual: той самий light theme, менше декору, `bg-muted` sidebar optional
- No Cloudinary upload UI in Phase 1

---

## Cloudinary (`OptimizedImage`) — PERF-01, D-14–D-15

**Package:** `next-cloudinary`  
**Env:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (secret server-only; Phase 1 delivery only)

**Wrapper:** `components/media/optimized-image.tsx`

```tsx
// Contract (executor implements)
import { CldImage, type CldImageProps } from "next-cloudinary";

type OptimizedImageProps = Omit<CldImageProps, "src"> & {
  src: string; // public_id or full Cloudinary URL
  alt: string; // required — UA, descriptive
  sizes?: string;
  priority?: boolean;
};

// Defaults enforced in wrapper:
// format="auto" (f_auto)
// quality="auto" (q_auto)
// sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" for hero — override per call
```

| Usage | sizes | priority | Notes |
|-------|-------|----------|-------|
| Hero | `(max-width: 1024px) 100vw, 50vw` | `true` | 1–2 demo images |
| Category icon (optional) | `80px` | `false` | Якщо є thumbnail у seed |
| Auth pages | — | no image required | |

**Accessibility:** `alt` обов’язковий українською; декоративні — `alt=""` + `aria-hidden` (рідко).

**Phase 1 out of scope:** `CldUploadWidget`, signed upload route (Phase 4).

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (hero) | **«Переглянути категорії»** |
| Primary CTA (auth submit login) | **«Увійти»** |
| Primary CTA (auth submit register) | **«Створити обліковий запис»** |
| Empty state (cabinet) heading | **«Поки що порожньо»** |
| Empty state (cabinet) body | **«Тут з’являться ваші замовлення та чат з магазином — незабаром.»** |
| Category stub heading support | **«Незабаром»** (badge) |
| Category stub body | **«Ми наповнюємо каталог. А поки що перегляньте інші категорії.»** |
| Error state (auth generic) | **«Не вдалося увійти. Перевірте email і пароль або спробуйте ще раз.»** |
| Error state (register duplicate) | **«Користувач з таким email уже існує. Увійдіть або відновіть доступ.»** (recovery — Phase 2+; link на `/uviity`) |
| Error state (network) | **«З’єднання перервано. Перевірте інтернет і спробуйте знову.»** |
| Destructive confirmation | Phase 1: **немає** destructive user actions у UI |
| Sign out | **«Вийти»** (dropdown) — no modal |

**Microcopy:** placeholders — «Email», «Пароль», «Підтвердіть пароль»; loading buttons — «Зачекайте…»

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | `lang="uk"`; не змішувати EN в UI copy |
| Focus | Visible `:focus-visible` ring (`--ring`); порядок tab логічний (header → main → footer) |
| Touch | Min 44×44px targets на mobile |
| Forms | `<label>` + `id`; `aria-invalid` + `aria-describedby` для errors |
| Images | Meaningful `alt` на всіх `OptimizedImage` |
| Motion | `prefers-reduced-motion`: вимкнути hover translate на картках |
| Contrast | Text `foreground` on `background` ≥ WCAG AA; primary button white on oklch primary |
| Skip link | Optional Phase 1: **«Перейти до вмісту»** → `#main-content` |
| Auth errors | `role="alert"` на Alert component |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | button, card, input, label, form, alert, separator, skeleton, badge, avatar, dropdown-menu, sheet | not required |
| Third-party | **none** | — |

`shadcn_initialized: false` — vetting third-party blocks **не застосовується** до init. Після init лише official registry.

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| UI-01 | `lang="uk"`, всі copy UA |
| UI-02 | Tokens, shadcn new-york, light airy layout |
| UI-03 | Breakpoints, mobile-first grid, 44px targets |
| PERF-01 | `OptimizedImage` + f_auto/q_auto |
| AUTH-01 | Public home, categories, stubs without login |
| AUTH-02 | `/uviity`, `/reiestratsiia` forms |
| AUTH-05 | Session persists — no UI change; cabinet reflects logged state |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

<!-- UI-SPEC COMPLETE — ready for gsd-ui-checker validation -->
