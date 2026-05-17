---
phase: 09-wishlist
plan: 02
subsystem: api
tags: [prisma, server-actions, wishlist]
requires:
  - plan: 09-01
    provides: WishlistItem schema
provides:
  - wishlist.service CRUD + list without prune
  - wishlist.actions with revalidation
affects: [09-03, 09-04, 09-05]
key-files:
  created:
    - src/server/services/wishlist.service.ts
    - src/server/actions/wishlist.actions.ts
    - src/types/wishlist.ts
requirements-completed: [WISH-02, WISH-03, WISH-04]
completed: 2026-05-17
---

# 09-02 Summary

Server wishlist persistence: add/remove for AVAILABLE only, list includes SOLD/DRAFT as unavailable, guest resolve action, no merge.

## Self-Check: PASSED
