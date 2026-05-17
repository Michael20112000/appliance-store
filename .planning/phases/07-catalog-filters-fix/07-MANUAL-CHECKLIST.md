# Phase 7 — Manual verification checklist

Operator gate before closing **catalog-filters-fix**. Matches ROADMAP Phase 7 success criteria.

**Prerequisites:** `npm run dev` running, database seeded with catalog products.

---

## 1. Minimum price filter hides cheaper products

- [ ] Open `/katalog?cina-vid=13000`
- [ ] Confirm every visible product price is **≥ 13 000 ₴** (no cheaper items in the grid)
- [ ] Optional: compare with `/katalog` unfiltered — cheapest items should disappear

## 2. Slider syncs URL and resets pagination

- [ ] Open `/katalog` (desktop `lg+` viewport for aside slider)
- [ ] Drag price slider thumbs; URL gains `cina-vid` and/or `cina-do` within ~200ms
- [ ] If `сторінка` was > 1, confirm it resets to **1** after price change
- [ ] Release thumb (`onValueCommitted`); URL reflects final values

## 3. Category-scoped brand dropdown

- [ ] Open a category page, e.g. `/katalog/telephony` (or any slug with a narrow brand set)
- [ ] Open brand `<select>` in filters (desktop aside or mobile **Фільтри** sheet)
- [ ] Confirm brands **not** sold in that category (e.g. Bosch, Whirlpool if absent from DB) do **not** appear
- [ ] Compare with global `/katalog` — brand list may be wider

## 4. Vitest regression (automated)

- [ ] Run:

```bash
npm test -- src/lib/catalog/search-params.test.ts src/server/services/catalog.service.test.ts
```

- [ ] Exit code **0**; includes `cinaVid: 13000` → `minPrice: 1_300_000` and `getDistinctBrands(categoryId?)` cases

## 5. Slider drag refreshes product grid

- [ ] On `/katalog`, note product count or first card title
- [ ] Drag slider to narrow range; grid **updates** (fewer/different products) without full page reload
- [ ] Mobile: repeat in **Фільтри** sheet (`< lg` viewport)

---

## E2E regression (automated, not manual)

```bash
npm run test:e2e -- e2e/catalog-filters-url.spec.ts
```

No dedicated Playwright price/slider spec — manual steps 1, 2, and 5 cover slider UX.

---

**Sign-off:** Date ______ | Verified by ______
