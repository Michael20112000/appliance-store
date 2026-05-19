---
phase: 26-footer-mobile-contact
status: passed
score: 4/4
verified: 2026-05-19
---

# Phase 26 Verification

## Must-haves

| ID | Criterion | Result |
|----|-----------|--------|
| FOOT-01 | Footer phone + email from DB | PASS — `StoreFooter` uses `getPublicStoreContacts()` |
| FOOT-02 | Footer callback form | PASS — `CallbackRequestForm` in footer right column |
| FOOT-03 | Callback form in mobile drawer | PASS — after `Separator` in `StoreMobileNav` |
| FOOT-04 | Category count badges in drawer | PASS — `Badge` with `productCount` per row |

## Automated checks

- `npm run build` — PASS
- Phase Vitest (validators, services, callback form, mobile nav) — PASS
- Prisma migration `20260519170231_store_settings_and_callback` — applied

## Human verification (optional UAT)

1. `/admin/nalashtuvannia` — add phone/email/address; confirm footer updates.
2. Desktop footer — two columns, lazy map below primary address.
3. Mobile drawer — badges, separator, callback form.
4. Submit callback — success toast + cleared field; 6th request/hour shows inline rate limit.

## Notes

- Full `npm test` may fail `prisma/seed.test.ts` if DB lacks seeded out-of-stock products (unrelated to phase 26).
