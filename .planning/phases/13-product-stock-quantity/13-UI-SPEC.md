---
phase: 13
slug: product-stock-quantity
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 11–12)"
created: 2026-05-18
locale: uk
extends: 12-UI-SPEC.md
---

# Phase 13 — UI Design Contract (Product Stock Quantity — Admin Only)

> Поле та колонка **«Кількість»** в адмінці (форма create/edit + таблиця `/admin/tovary`). Storefront **не показує** залишок. **Розширює** Phase 11–12 — токени, spacing, typography, 60/30/10 **без змін**. Джерела: `13-CONTEXT.md` (D-13-01–13), `REQUIREMENTS.md` ADM-PRD-03, `12-UI-SPEC.md`, код: `product-form.tsx`, `admin-products-table.tsx`, `upsertProductSchema`.

**Codebase reality (verified):** `product-form` має `priceUah` у `sm:grid-cols-2` без `quantity`; `admin-products-table` — sortable колонки Назва/Категорія/Ціна/Статус; `AdminProductListItem` без `quantity`. Основна UI-робота — **одне поле в формі** + **одна plain колонка в таблиці** + validator copy.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn `base-nova`) |
| Icon library | `lucide-react` — **без нових іконок** у фазі |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** (admin) |
| Document | `<html lang="uk">` |

**Phase 13 shadcn add:** **none** — reuse `input`, `label`, `alert`, `button`.

**Не змінювати** OKLCH токени в `:root` / `@theme`.

---

## Spacing Scale

**Успадковано з Phase 11–12** — див. `12-UI-SPEC.md`.

| Token | Value | Phase 13 usage |
|-------|-------|----------------|
| xs | 4px | — |
| sm | 8px | Form field `space-y-2` між Label і Input |
| md | 16px | Form grid `gap-6`, table wrapper без змін |
| lg | 24px | — |
| xl | 32px | — |

**Exceptions (Phase 13):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Quantity input | `h-9` (via shadcn `Input`) | Паритет із `priceUah` |
| Products table cell | `px-3 py-2` | Нова колонка — **ті самі** відступи |
| Form grid column | `sm:grid-cols-2` | `priceUah` + `quantity` в **одному рядку** сітки |

**Touch target:** `Input type="number"` — висота trigger `h-9` (~36px); достатньо для admin desktop-first.

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600).

| Role | Size | Weight | Line height | Phase 13 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Optional helper під полем |
| Label | 14px | 600 | 1.4 | `Label htmlFor="quantity"` — **«Кількість»** |
| Heading | 20px / 24px | 600 | 1.2 | Page H1 — без змін |
| Display | 28px | 600 | 1.15 | — |

**Table body:** `text-sm tabular-nums` у комірці кількості (як ціна).

**Field errors:** `text-sm text-destructive` — паритет із `priceUah`.

---

## Color

**Успадковано** з Phase 11–12.

| Role | Token | Phase 13 usage |
|------|-------|----------------|
| Dominant (60%) | `--background` | Form / table surfaces |
| Secondary (30%) | `--muted` | Table header `bg-muted/50`; helper `text-muted-foreground` |
| Accent (10%) | `--primary` | **«Зберегти»** CTA — без змін |
| Destructive | `--destructive` | Field validation errors; **«Видалити»** — без змін |

**Accent reserved for (Phase 13):**

1. Primary submit **«Зберегти»** (існуючий)
2. Destructive **«Видалити»** на edit (існуючий)

**НЕ accent:** значення quantity в таблиці, number input border/focus (стандартний shadcn Input).

**Low-stock badge (discretion):** **не додавати в v1** — plain integer; опційно Phase 13+ як `Badge variant="secondary"` при `quantity <= 2` **лише** якщо planner додасть окремий task.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | **«Зберегти»** / pending **«Збереження…»** — без змін |
| Field label | **«Кількість»** |
| Field helper (create, optional) | **«Скільки однакових одиниць у цьому оголошенні.»** — `text-xs text-muted-foreground` під input, **лише mode=create** |
| Field helper (edit, optional) | **«0 — списання без продажу; після останнього checkout залишок стає 0 і статус «Продано».»** — **лише** якщо executor додає hint; мінімум v1 — **без** helper на edit |
| Table header | **«Кількість»** |
| Empty state (products list) | **«Товарів не знайдено. Створіть перший товар або змініть фільтри.»** — без змін |
| Form error (Zod, create min) | **«Кількість має бути не менше 1»** |
| Form error (Zod, max) | **«Максимум 999 одиниць»** |
| Form error (Zod, integer) | **«Вкажіть ціле число»** |
| Form save error | Існуючі `errorMessages` у `product-form.tsx` — без змін |
| Sold status alert | **«Статус «Продано» встановлюється лише через замовлення…»** — без змін; quantity **редагується** навіть при SOLD |
| Destructive confirmation | **«Видалити товар? Дію не можна скасувати…»** — без змін |

**Storefront:** жодного copy про залишок / «В наявності N шт» — **заборонено** в цій фазі (D-13-13).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | — (reuse `input`, `label`) | not required |
| Third-party | **none** | — |

`registries: {}` — vetting third-party **не потрібен**.

---

## Business Rules (UI-facing)

| Rule | Spec |
|------|------|
| ADM-PRD-03 | Адмін бачить і задає кількість у **формі** та **списку**; storefront без quantity |
| Units | Цілі **штуки** (`Int`), не kopiyky; без копійок / десяткових |
| Create default | `quantity: 1` у `defaultValues` react-hook-form |
| Create validation | `min: 1`, `max: 999`, integer |
| Edit validation | `min: 0`, `max: 999`, integer (D-13-10) |
| Max cap | **999** (D-13-08 discretion → зафіксовано в контракті) |
| Checkout decrement | **Без UI** у фазі — backend only (D-13-04–07); після продажу адмін бачить оновлене число після refresh |
| SOLD + quantity 0 | Після checkout — `status: SOLD`, `quantity: 0`; таблиця показує **0** і статус «Продано» |
| Manual AVAILABLE + 0 | Допустимо на edit (edge); **без** warning banner у v1 |
| Cart / storefront | Не показувати quantity; не додавати stepper на PDP/каталог |

---

## Component Inventory (Phase 13)

### Reused (no new shadcn)

| Component | Usage |
|-----------|--------|
| `Input` | `type="number"`, `id="quantity"` |
| `Label` | `htmlFor="quantity"` |
| `product-form.tsx` | Додати поле + `defaultValues.quantity` |
| `admin-products-table.tsx` | Plain `<th>` + `<td>` |
| `Alert` / `Button` | Без змін |

### New / delta

| Artifact | Path | Responsibility |
|----------|------|----------------|
| `quantity` у schema | `src/server/validators/admin-product.ts` | `upsertProductSchema` / `updateProductSchema` — окремі refine для create vs edit **або** superRefine за mode на action |
| List DTO | `admin-product.service.ts` | `quantity` у `listAdminProducts` select |
| `AdminProductListItem` | `admin-products-table.tsx` | `quantity: number` |

**Executor:** один shared `quantity` field component **не обовʼязковий** — дублювання markup як у `priceUah` достатньо.

---

## Component Specs

### `ProductForm` — поле «Кількість» (D-13-11)

**Path:** `src/components/admin/product-form.tsx`

#### Placement (prescriptive)

У сітці `grid gap-6 sm:grid-cols-2` розмістити **поруч із ціною**:

| Column (sm row) | Field |
|-----------------|-------|
| Col 1 | `priceUah` — **«Ціна (грн)»** (без змін) |
| Col 2 | `quantity` — **«Кількість»** *(нове)* |

Поточний блок `status` (коли `!isSold`) залишити **наступним рядком** (повна ширина або col 1), **не** витісняти в той самий рядок із ціною.

При `isSold === true`: поле quantity **лишається видимим і editable**; блок `status` прихований (як зараз).

#### Markup (prescriptive)

```tsx
<div className="space-y-2">
  <Label htmlFor="quantity">Кількість</Label>
  <Input
    id="quantity"
    type="number"
    min={mode === "create" ? 1 : 0}
    max={999}
    step={1}
    inputMode="numeric"
    className="tabular-nums"
    {...form.register("quantity", { valueAsNumber: true })}
  />
  {mode === "create" ? (
    <p className="text-xs text-muted-foreground">
      Скільки однакових одиниць у цьому оголошенні.
    </p>
  ) : null}
  {form.formState.errors.quantity ? (
    <p className="text-sm text-destructive">
      {form.formState.errors.quantity.message}
    </p>
  ) : null}
</div>
```

#### defaultValues

```ts
quantity: defaultValues?.quantity ?? 1,
```

#### Behavior

| Mode | min | max | Default |
|------|-----|-----|---------|
| create | 1 | 999 | 1 |
| edit | 0 | 999 | from server |

**Не** використовувати `disabled` на quantity для SOLD — адмін може виставити 0 вручну (D-13-10).

**Паритет із price:** той самий `Input`, `valueAsNumber: true`, inline error під полем.

---

### `AdminProductsTable` — колонка «Кількість» (D-13-12)

**Path:** `src/components/admin/admin-products-table.tsx`

#### Column order (prescriptive)

| # | Header | Sortable (Phase 12) |
|---|--------|---------------------|
| 1 | Фото | Ні |
| 2 | Назва | Так |
| 3 | Категорія | Так |
| 4 | Ціна | Так |
| 5 | **Кількість** | **Ні** (v1) |
| 6 | Статус | Так |

#### Header markup

```tsx
<th className="px-3 py-2 font-medium">Кількість</th>
```

**Без** `AdminSortableTableHeader`, **без** `aria-sort`, **без** sort icon (D-13-12, deferred sort).

#### Cell markup

```tsx
<td className="px-3 py-2 tabular-nums">{product.quantity}</td>
```

- Відображати **сире ціле** (0, 1, 2, … 999)
- **Без** одиниць «шт.» у v1 (коротша колонка; контекст зрозумілий з заголовка)
- **Без** badge / кольорового акценту для low stock у v1

#### Type delta

```ts
export type AdminProductListItem = {
  // ...existing
  quantity: number;
};
```

**Row-click / status Select:** без змін — quantity cell не `stopPropagation` (не interactive).

---

### Storefront — explicit non-change

| Surface | Phase 13 |
|---------|----------|
| `/katalog`, `/katalog/[slug]`, `/tovar/[slug]` | **Не** додавати quantity, badge, «залишилось N» |
| Cart / checkout UI | **Не** змінювати copy про кількість лінії (лишається 1) |

Regression check: grep storefront components — **немає** `product.quantity` у JSX після фази.

---

## States & Interactions

### Quantity input (form)

| State | Visual / behavior |
|-------|-------------------|
| Default (create) | Value `1` |
| Default (edit) | Server value |
| Invalid (client Zod) | Red error text під полем |
| Submitting | `Button` disabled via `isSubmitting` — поле **не** disabled окремо |
| Browser spinners | Native `type="number"` spin buttons — **допустимо** (як price) |

### Quantity cell (table)

| State | Visual / behavior |
|-------|-------------------|
| Any value 0–999 | Plain number, `tabular-nums` |
| Row hover | Успадкований `bg-muted/40` — число без окремого стилю |
| Click row | Navigate to edit — quantity не interactive |

---

## Mobile-First Patterns

| Pattern | Implementation |
|---------|----------------|
| Form grid | `sm:grid-cols-2` — на вузьких екранах price і quantity **стеком** (full width кожне) |
| Table | `overflow-x-auto` — додаткова колонка в horizontal scroll (як Phase 12) |
| Не ховати | Колонку «Кількість» на mobile |

---

## Responsive

| Surface | Behavior |
|---------|----------|
| `/admin/tovary` | +1 колонка; scroll при overflow |
| Create/edit product | Price + quantity side-by-side від `sm` breakpoint |

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | UA labels; `lang="uk"` |
| Label association | `Label htmlFor="quantity"` + `Input id="quantity"` |
| Errors | Повідомлення в DOM під полем (не лише toast) |
| Table header | Текст **«Кількість»** достатній; окремий `abbr` не потрібен |
| `inputMode` | `numeric` на mobile keyboard |
| Sort | Колонка не sortable — **немає** `aria-sort` |

---

## Out of Scope (UI)

| Item | Phase |
|------|-------|
| Quantity на storefront (PDP, catalog cards) | v2 / D-13-13 |
| Sort колонки «Кількість» | post-v1 (deferred) |
| Low-stock badge (`quantity <= 2`) | discretion — default **out** |
| Inline edit quantity в таблиці | — |
| Warning при AVAILABLE + quantity 0 | planner discretion — default **out** |
| Cart line qty > 1 UI | — |
| Нові shadcn components | — |

---

## Verification Checklist

### Manual

- [ ] `/admin/tovary/novyi` — поле «Кількість» default 1; поруч із ціною на `sm+`
- [ ] Create з quantity 0 або порожнім — Zod error, submit blocked
- [ ] Create з quantity 1 — success
- [ ] Edit — можна зберегти quantity 0
- [ ] Edit SOLD — quantity видиме, можна змінити
- [ ] `/admin/tovary` — колонка «Кількість» між «Ціна» і «Статус»
- [ ] Header «Кількість» без sort icon / без зміни URL при кліку
- [ ] Значення в таблиці збігається з БД після checkout decrement
- [ ] Storefront PDP/каталог — **немає** quantity UI (regression)
- [ ] Row-click на quantity cell → edit product (regression)

### Automated (recommended)

- [ ] Validator tests — create `quantity < 1`, edit `quantity: 0` ok, `quantity > 999` fail
- [ ] Optional: snapshot/admin test — table header order includes «Кількість»

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| ADM-PRD-03 | Form field + table column; storefront excluded |
| D-13-08–10 | min/max, create vs edit rules |
| D-13-11–12 | Placement, labels, no sort |
| D-13-13 | Storefront non-change section |
| ROADMAP Phase 13 | Admin visibility of stock |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
