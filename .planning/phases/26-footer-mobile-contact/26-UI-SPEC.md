---
phase: 26
slug: footer-mobile-contact
status: draft
shadcn_initialized: true
preset: base-nova (style), neutral baseColor, cssVariables, lucide icons — from components.json
created: 2026-05-19
---

# Phase 26 — Footer & mobile contact — UI Design Contract

> Visual and interaction contract for FOOT-01…04. Generated from `26-CONTEXT.md` (D-01…D-23), `REQUIREMENTS.md`, codebase patterns. Storefront focus + minimal admin surface notes.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn (initialized) |
| Preset | `base-nova`, `neutral`, CSS variables — `components.json` |
| Component library | Base UI primitives via `@/components/ui/*` |
| Icon library | lucide-react |
| Font | Project `--font-sans` (globals.css) |
| Toast | sonner — storefront `Toaster` already in `(storefront)/layout.tsx` |

**Registry:** shadcn official only (`registries: {}`). No third-party blocks this phase.

---

## Spacing Scale

Project-standard 8pt scale (Tailwind multiples of 4):

| Token | Value | Usage in this phase |
|-------|-------|---------------------|
| xs | 4px | Badge internal padding (default) |
| sm | 8px | Contact list item gap; form field stack |
| md | 16px | Footer column gap; drawer list `gap-2` |
| lg | 24px | Footer main grid gap; drawer separator margins |
| xl | 32px | Footer vertical padding (`py-8`) |
| 2xl | 48px | — |
| 3xl | 64px | — |

**Exceptions:**

- Touch targets: category links and form submit — **min-height 44px** (`min-h-11`), matching `StoreMobileNav` and header nav.
- Map iframe: **height 200px** desktop, **160px** mobile (fixed; not on spacing scale).

---

## Typography

| Role | Size | Weight | Line height | Usage |
|------|------|--------|-------------|-------|
| Body | 14px (`text-sm`) | 400 | 1.5 | Contact lines, form labels, copyright |
| Label | 14px (`text-sm`) | 500 (`font-medium`) | 1.5 | Section headings in footer («Контакти» implicit blocks), callback heading |
| Heading | 16px (`text-base`) | 600 (`font-semibold`) | 1.2 | Callback form title only |
| Display | — | — | — | Not used this phase |

**Weights in phase:** 400 (body), 500 (labels), 600 (callback heading only).

---

## Color

Uses existing CSS variables (`globals.css`). No new tokens.

| Role | Token / class | Usage (60/30/10) |
|------|---------------|------------------|
| Dominant (60%) | `bg-background` / page | Main content above footer |
| Secondary (30%) | `bg-muted/40`, `border-border` | Footer shell (`store-footer` today) |
| Muted text | `text-muted-foreground` | Contact secondary lines, category count badges |
| Foreground | `text-foreground` | Phone/email links, callback heading |
| Accent (10%) | `bg-primary`, `text-primary-foreground` | **Only** callback submit button (`Button` default variant) |
| Destructive | `text-destructive`, `border-destructive` | Inline field errors only |

**Accent reserved for:** primary CTA «Передзвоніть мені» submit button. Phone/email/address links use `text-foreground` with `underline-offset-4 hover:underline` — not primary fill.

**Category count badges:** `Badge variant="secondary"` + `text-muted-foreground` (muted, not accent).

---

## Scope

| Surface | In scope |
|---------|----------|
| `StoreFooter` | Contacts, lazy map, callback form, copyright row |
| `StoreMobileNav` | Category count badges, separator, `CallbackRequestForm` |
| `CallbackRequestForm` | New shared client component (footer + drawer) |
| `getStoreNap` / homepage snippets | Consume DB settings (D-07) — same visual tokens as footer contacts |
| Admin settings page | CRUD contacts + callback list (planner discretion on layout; copy UA below) |

**Out of scope:** Chat FAB, catalog filter UI, homepage category cards, CAPTCHA, error toasts, contacts block inside drawer.

---

## Footer layout (`StoreFooter`)

### Shell (unchanged baseline)

```text
<footer className="border-t border-border bg-muted/40">
  <motion.div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
```

### Desktop (≥ `md`): two columns

| Column | Width | Content top → bottom |
|--------|-------|----------------------|
| **Left** | `md:grid-cols-2` → 1fr | Phones → Emails → Addresses → Lazy map iframe |
| **Right** | 1fr | `CallbackRequestForm` |

Grid: `grid gap-8 md:grid-cols-2 md:gap-12`.

### Mobile (`< md`): single column stack

Order: **contacts block(s)** → **map** (if address exists) → **callback form** → **copyright row**.

### Contact blocks (FOOT-01, D-03–D-06)

| Type | Render when | Visual spec |
|------|-------------|-------------|
| Phones | ≥1 phone in settings | `<ul className="space-y-2">` of `<a href="tel:{normalized}">` with **display** formatted text (e.g. `+38 (050) 123-45-67`) |
| Emails | ≥1 email | Same list pattern; `mailto:{email}`; visible text = email |
| Addresses | ≥1 address | Each: `<button type="button">` or `<a>` opening external map URL in **new tab** (`rel="noopener noreferrer"`). Full address text, `text-sm`, left-aligned, hover underline |
| Map embed | ≥1 address (D-06) | `<iframe loading="lazy" title="Карта магазину" />` **below** address list in left column; `className="mt-4 w-full rounded-lg border border-border"`; fixed height per spacing exceptions; **no** Maps JS SDK |

**Omit entirely** when type has zero entries — no «незабаром», no placeholder paragraph (replaces current stub).

**Remove** standalone `м. Львів` line and «Телефон і email — незабаром» from `store-footer.tsx`.

### Copyright row (D-22)

Below main grid, full width:

```text
border-t border-border pt-6 mt-8
<p className="text-sm text-muted-foreground">© {year} Техніка б/у Львів</p>
```

Do not repeat city-only line if address block is shown.

---

## Mobile drawer (`StoreMobileNav`)

### Structure (top → bottom inside `SheetContent`)

1. `SheetHeader` / `SheetTitle` — **«Категорії»** (unchanged)
2. Category list (`ul`, `mt-4 flex flex-col gap-2`)
3. `Separator` — `className="my-6"` (D-17)
4. `CallbackRequestForm` with `className` variant for drawer (compact; same copy)

**No** phone/email/address in drawer (D-17, deferred).

### Category row (FOOT-04, D-18–D-20)

| Property | Spec |
|----------|------|
| Data | Only categories from `categoriesWithAvailableProducts` (already passed from header) |
| Count | Always show badge when row visible (`productCount ≥ 1`) |
| Layout | `Link` with `flex min-h-11 items-center justify-between gap-3 py-2 text-sm` |
| Name | Left, `truncate` if needed |
| Badge | Right: `<Badge variant="secondary" className="shrink-0 tabular-nums text-muted-foreground">{productCount}</Badge>` |

**Parity reference:** Same count semantics as `catalog-filters.tsx` sidebar badges; alignment differs (drawer = `justify-between`, filters = `gap-2` inline).

### Empty category list

If `categories.length === 0`: render empty `ul` (no message), then separator + form still shown.

---

## `CallbackRequestForm` (FOOT-02, FOOT-03, D-08–D-16)

**Single component** — props: optional `idPrefix` for duplicate `htmlFor` ids, optional `className`, optional `compact?: boolean` (drawer: slightly tighter `space-y-4` vs footer `space-y-6`).

### Layout

| Element | Spec |
|---------|------|
| Heading | `h2` or `p` with `text-base font-semibold text-foreground` — **«Вкажіть свій номер — ми передзвонимо»** |
| Field | `Label` «Телефон» + `Input` `type="tel"` `inputMode="numeric"` `maxLength={15}` `placeholder="0978734712"` — match `checkout-form.tsx` |
| Submit | `Button` type="submit" default variant, full width on mobile, `min-h-11` — **«Передзвоніть мені»** |
| Error | `p` below input: `text-sm text-destructive` — Zod message or server message; `aria-live="polite"` |

### Validation (D-11)

Reuse `uaPhoneSchema` message: **«Вкажіть номер телефону — лише цифри, від 10 до 15»**

Client: react-hook-form + zodResolver (same pattern as checkout). Server action returns field-level error string for inline display.

### Success (D-12)

- `toast.success("Дякуємо, передзвонимо")` — **only** success toast this form
- Clear phone field (`reset` field value)
- No success banner in DOM

### Errors (D-13–D-14)

| Case | UX |
|------|-----|
| Validation | Inline under field only |
| Server / network | Inline under field: **«Не вдалося надіслати заявку. Спробуйте ще раз.»** |
| Rate limit | Inline: **«Занадто багато запитів. Спробуйте пізніше.»** (or server-provided UA string) |
| **Forbidden** | **No `toast.error`** anywhere for this form |

### Loading

Submit button: `disabled` + optional `aria-busy` while pending; label unchanged (no spinner required; optional `Loader2` icon acceptable).

---

## Copywriting Contract

| Element | Copy (UA, locked) |
|---------|-------------------|
| Callback heading | Вкажіть свій номер — ми передзвонимо |
| Phone label | Телефон |
| Phone placeholder | 0978734712 |
| Primary CTA | Передзвоніть мені |
| Success toast | Дякуємо, передзвонимо |
| Phone validation (Zod) | Вкажіть номер телефону — лише цифри, від 10 до 15 |
| Generic submit error | Не вдалося надіслати заявку. Спробуйте ще раз. |
| Rate limit error | Занадто багато запитів. Спробуйте пізніше. |
| Drawer sheet title | Категорії |
| Map iframe title | Карта магазину |
| Copyright | © {year} Техніка б/у Львів |

| Element | Copy |
|---------|------|
| Empty state (footer contacts) | **None** — omit block (D-03) |
| Empty state (drawer categories) | **None** — empty list, form still visible |
| Destructive confirmation | **N/A** this phase |

### Admin (operator-facing, planner may adjust layout)

| Element | Suggested copy |
|---------|----------------|
| Nav item | Налаштування / Контакти (planner picks one slug) |
| Phones section | Телефони |
| Emails section | Email |
| Addresses section | Адреси |
| Callback list heading | Заявки на дзвінок |
| Empty callback list | Ще немає заявок |

---

## Component Inventory

| Component | Source | Notes |
|-----------|--------|-------|
| `Button` | `@/components/ui/button` | Submit CTA |
| `Input` | `@/components/ui/input` | Phone field |
| `Label` | `@/components/ui/label` | Field label |
| `Badge` | `@/components/ui/badge` | `variant="secondary"` counts |
| `Separator` | `@/components/ui/separator` | Drawer only |
| `Sheet*` | `@/components/ui/sheet` | Existing mobile nav |
| `toast` | `sonner` | Success only |

**New files (executor):**

- `src/components/layout/callback-request-form.tsx` — client
- Refactor `store-footer.tsx` — server; embed client form island
- Update `store-mobile-nav.tsx` — badges + separator + form

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | button, input, label, badge, separator, sheet (existing) | not required |
| Third-party | none | — |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Phone links | Visible formatted number; `tel:` uses normalized digits |
| External map | `target="_blank"` + `rel="noopener noreferrer"`; keyboard activatable |
| Form errors | Associated via `aria-describedby` on input when error present |
| Menu trigger | Existing `aria-label="Меню"` |
| Iframe | `title="Карта магазину"` |

---

## Performance (D-06)

- Map: iframe only, `loading="lazy"`, no Google Maps JS on initial load
- Footer remains mostly server-rendered; `CallbackRequestForm` is client island only
- Do not block LCP with map (below fold in typical layouts)

---

## Verification (visual / UAT)

1. **Footer desktop:** Two columns; left shows configured phones/emails/address + lazy map; right shows callback form; copyright below.
2. **Footer mobile:** Single column stack; same content order; submit full width.
3. **Empty settings:** Types with no entries omitted; no «незабаром»; callback + copyright still render.
4. **Phone:** Display formatted; tap calls correct `tel:` URI.
5. **Email:** `mailto:` works.
6. **Address:** Click opens map; iframe visible when address configured.
7. **Callback:** Valid submit → success toast + field cleared; invalid → inline only; rate limit → inline; no error toast.
8. **Drawer:** Each category has right-aligned muted count badge; zero-count categories absent; separator then identical callback form.
9. **Parity:** Footer/header/homepage contact data from single DB source (no env stub on storefront).

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

*Phase: 26-footer-mobile-contact*  
*Sources: 26-CONTEXT.md (23 decisions), REQUIREMENTS FOOT-01…04, ROADMAP Phase 26, store-footer/mobile-nav/header, checkout-form, catalog-filters badges, components.json*
