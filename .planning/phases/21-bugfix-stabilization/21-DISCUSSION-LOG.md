# Phase 21: Bugfix stabilization — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 21-bugfix-stabilization
**Areas discussed:** Phase closure (wave 3), retro GSD, verification bar, inventory/guest (inferred)

---

## Phase closure (wave 3)

| Option | Description | Selected |
|--------|-------------|----------|
| Verify-only close | Waves 1–2 done on main; CI + manual checklist; no new intake | ✓ |
| Wait for wave 3 | New `bugfix-intake-YYYY-MM-DD.md` before plan/execute | |
| Keep phase open indefinitely | No formal close | |

**User's choice:** Verify-only — «наразі проект працює добре, лиш би не проїбати це» (не чекати wave 3).
**Notes:** New bugs later → new intake file, not blocking phase 21 verify close.

---

## Retro GSD hygiene

| Option | Description | Selected |
|--------|-------------|----------|
| Verify-only plan | `21-01-PLAN` documents checks; no re-implement BUG-12…17 | ✓ |
| Retro execute per bug | Re-walk each bug with commits | |
| Skip GSD entirely | No plan | |

**User's choice:** Inferred from verify-only + working main — D-21-03/D-21-04 in CONTEXT.

---

## Verification bar

| Option | Description | Selected |
|--------|-------------|----------|
| Wave-level smoke | build + test suite + one manual checklist | ✓ |
| Per-bug retro commits | One commit per BUG-12…17 | |

**User's choice:** Claude discretion aligned with operator goal (minimal churn) — D-21-05…07.

---

## Guest + inventory edge

| Option | Description | Selected |
|--------|-------------|----------|
| Same rules as BUG-15 | Guest PENDING orders use admin CONFIRMED/CANCELLED inventory | ✓ |
| Separate guest inventory path | | |

**User's choice:** Not explicitly asked; locked in CONTEXT D-21-08…11 from intake + existing code.

---

## Claude's Discretion

- Manual checklist row detail (planner).
- Whether to spawn `21-02-PLAN` only if verify finds blockers.

## Deferred Ideas

- Wave 3 intake when new bugs appear.
- Catalog pagination stash merge.
- Phase 19 human UAT, CWV v2.
