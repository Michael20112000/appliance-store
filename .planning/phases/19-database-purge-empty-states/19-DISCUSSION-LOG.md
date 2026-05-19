# Phase 19: Database Purge & Empty States - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 19-Database Purge & Empty States
**Areas discussed:** Scope purge, Command safety, Homepage/storefront empty, Post-purge operator workflow (all via Claude discretion)

---

## Scope purge

| Option | Description | Selected |
|--------|-------------|----------|
| Business tables only, keep User/Session/Account | Admin login survives; carts/wishlist/orders/chats/products/categories cleared | ✓ |
| Full DB truncate including users | Cleanest auth slate; requires re-seed admin | |
| Delete buyers, keep admin users only | Middle ground | |

**User's choice:** «все на свій вибір» — Claude selected business-only purge (D-19-01…D-19-05).
**Notes:** FK order Message→…→Category; transactional deleteMany; idempotent.

---

## Command safety

| Option | Description | Selected |
|--------|-------------|----------|
| `npm run db:purge` + `--confirm` / env + production block | Explicit operator intent; separate from seed | ✓ |
| `seed --purge` flag | Couples destructive + constructive flows | |
| Interactive stdin «type PURGE» | Harder in CI/scripts | |

**User's choice:** Claude discretion — D-19-06…D-19-10.

---

## Homepage / storefront empty

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Phase 15 behavior (no CategoryGrid section) | Hero + HowToBuy only after purge | ✓ |
| Add «Каталог наповнюється» section | More operator-friendly empty shop | |
| Show all categories with 0 badges | Conflicts with CAT-04 | |

**User's choice:** Claude discretion — D-19-11…D-19-14; audit-only for admin routes.

---

## Post-purge operator workflow

| Option | Description | Selected |
|--------|----------|
| Purge then optional manual `prisma db seed` | Documented two-step; no auto-seed | ✓ |
| Purge auto-runs seed | Risky if operator only wanted delete | |
| Purge deletes users; mandatory seed | Heavier recovery | |

**User's choice:** Claude discretion — D-19-15…D-19-18 + manual checklist.

---

## Claude's Discretion

All four gray areas — user explicitly deferred entirely («все на свій вибір»).

## Deferred Ideas

- Cloudinary purge (per REQUIREMENTS out of scope)
- Purge buyer User records
- Homepage marketing empty block
