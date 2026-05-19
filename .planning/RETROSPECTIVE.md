# Project Retrospective

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
| v1.4 | 21 | Stabilization / verify |
| v1.3 | 17–20 | Admin UX + guest + data ops |
| v1.2 | 11–16 | Polish & UX |
| v1.1 | 7–10 | Engagement & fixes |
| v1.0 | 1–6 | MVP |
