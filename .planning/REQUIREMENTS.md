# Requirements — Milestone v2.2 Bugfixes & Small Features

**Milestone goal:** Покращити storefront — соцмережі, floating-кнопки, анімації, та закрити дрібні баги.

---

## Requirements

### SOCIAL — Соцмережі

- [x] **SOC-01**: User can see Telegram, Viber, WhatsApp links in the site header
- [x] **SOC-02**: User can see the same social links in the mobile drawer
- [x] **SOC-03**: User can see the same social links in the footer

### FAB — Floating кнопки

- [ ] **FAB-01**: User always sees a cart button in the bottom-left floating zone (visible even when cart is empty)
- [ ] **FAB-02**: User can open a callback dialog from a floating button — бачить номер магазину та форму для введення свого телефону

### CATALOG — Каталог

- [ ] **SLIDER-01**: User can drag the price range slider in steps of 50 UAH and snap back to the real catalog min/max at the extremes

### ANIM — Анімації

- [ ] **ANIM-01**: User sees subtle non-intrusive animations on the storefront (fade page transitions; admin excluded)

### BUG — Баги

- [ ] **BUG-25**: User clicking the address link in the footer is taken to a proper Google Maps URL (not an embed API URL)

---

## Future Requirements

- PERF-01 — Core Web Vitals / Lighthouse
- SEO-01/02 — GSC, custom domain
- REV-01/02 — відгуки на товари

## Out of Scope

- Онлайн-оплата, доставка за межі Львова, маркетплейс
- Багатомовність
- Відгуки (REV) — post-v3.0
- Анімації в адмінці

---

## Traceability

| REQ-ID    | Phase | Notes |
|-----------|-------|-------|
| SOC-01    | 41    | Social links in header |
| SOC-02    | 41    | Social links in mobile drawer |
| SOC-03    | 41    | Social links in footer |
| FAB-01    | 42    | Persistent cart FAB, bottom-left |
| FAB-02    | 42    | Callback FAB with phone dialog |
| SLIDER-01 | 43    | Price slider step 50 UAH + snap to real min/max |
| ANIM-01   | 43    | Fade page transitions, storefront only |
| BUG-25    | 43    | Footer address link fix (embed URL → Google Maps URL) |
