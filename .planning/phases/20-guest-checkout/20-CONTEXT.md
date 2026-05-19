# Phase 20: Guest Checkout — Context

**Goal:** Покупець оформлює замовлення без реєстрації — кошик у браузері, checkout лише з ім’ям і телефоном.

**Triggered:** Operator QA 2026-05-19 — після merge bugfix v1.4 знову редірект на `/uviity` при «Додати в кошик»; guest checkout WIP був у stash, не в `main`.

## Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| D-20-01 | Guest cart = `localStorage` key `appliance-cart-pending` (як CART-03 merge intent) | Без anonymous DB user; узгоджено з merge-on-login |
| D-20-02 | Guest order: `Order.userId` nullable + `guestAccessToken` (UUID) | Підтвердження без акаунта; cookie + `?access=` для перегляду |
| D-20-03 | Не редіректити на login після add-to-cart | UX вимога оператора |
| D-20-04 | Logged-in flow без змін | `createOrderFromCart` + `/kabinet` |
| D-20-05 | Після guest checkout — очистити pending localStorage | `GuestOrderCleanup` на confirmation |

## Out of scope (phase 20)

- Guest chat (лише login gate, як було)
- Прив’язка guest order до акаунта після реєстрації
- SMS / email підтвердження

## Success criteria

1. Guest: add to cart → `/koszyk` без login
2. Guest: `/zamovlennia` → форма → confirmation з номером замовлення
3. Guest: header показує badge кошика (`GuestCartNavLink`)
4. Logged-in: merge pending on login (`CartPendingMerge`) лишається
5. DB migration: nullable `userId`, unique `guestAccessToken`
