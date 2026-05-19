# Project Retrospective

## Milestone: v1.5 — Incremental polish & operator UX

**Shipped:** 2026-05-19  
**Phases:** 22–27 | **Plans:** 8

### What Was Built

Delivery-aware order status (UI + API). Admin category icons and «Товари» link. Product edit auto-save with debounced saves. Homepage hides empty categories. Footer/mobile contacts and callback from PostgreSQL. UAT-01 operator closure with purge checklist and intake BUG-18…23 verified.

### What Worked

- Vertical phases 22–26 shipped features; phase 27 dedicated UAT closure avoided scope creep
- `BUGFIX-WORKFLOW.md` intake mapped cleanly to verification in phase 27
- Reusing header catalog filter for homepage (HOME-03) — one source of truth

### What Was Inefficient

- No formal milestone audit before close; legacy UAT debt carried via acknowledge
- Stale Prisma dev singleton after phase 26 schema — caught in UAT, fixed in `db.ts`
- `prisma/seed.test.ts` fails without seeded out-of-stock products — documented P2 repeatedly

### Patterns Established

- `19-MANUAL-CHECKLIST.md` + `27-MANUAL-CHECKLIST.md` — operator entry points for purge vs full UAT
- Store settings tables survive `db:purge` — footer may still show contacts (documented expectation)
- P0/P1/P2 severity policy in UAT closure (≤30 min P1 fix budget)

### Key Lessons

- Run `prisma generate` + dev server restart after new models — or guard singleton in `db.ts`
- Close human_needed verification (phase 25) inside dedicated UAT phase, not ad-hoc
- Exclude stale Playwright guest-auth e2e from UAT gate until specs updated

---

## Milestone: v1.4 — Bugfix stabilization

**Shipped:** 2026-05-19  
**Phases:** 21 (verify-only) | **Plans:** 1

### What Was Built

BUG-12…17 verified on main; CI green after minimal test fixes; intake wave 1–2 closed.

### What Worked

- Verify-only phase after heavy bugfix waves — no re-implement regressions
- Consolidated manual checklist for operator sign-off
- Targeted Vitest before full suite caught inventory contracts early

### What Was Inefficient

- Stale `prisma/seed.test.ts` and guest phone format blocked `npm test` until Task 4
- v1.3 never had formal milestone archive until v1.4 close (ROADMAP still expanded)

### Patterns Established

- `BUGFIX-WORKFLOW.md`: intake → plan → execute → verify
- Inventory reserve on `PENDING → CONFIRMED` only; quantity-only product model

### Key Lessons

- Close milestones with `audit-open` acknowledge for legacy UAT debt, not block ship
- Phase 20 inline ship needs SUMMARY or explicit roadmap note for tooling

---

## Cross-Milestone Trends

| Milestone | Phases | Theme |
|-----------|--------|-------|
| v1.5 | 22–27 | Operator UX + UAT closure |
| v1.4 | 21 | Stabilization / verify |
| v1.3 | 17–20 | Admin UX + guest + data ops |
| v1.2 | 11–16 | Polish & UX |
| v1.1 | 7–10 | Engagement & fixes |
| v1.0 | 1–6 | MVP |
