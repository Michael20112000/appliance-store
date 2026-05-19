# Phase 27: Human UAT closure - Discussion Log

> **Audit trail only.** Decisions are in `27-CONTEXT.md`.

**Date:** 2026-05-19
**Phase:** 27-human-uat-closure
**Areas discussed:** scope, checklist, db_setup, gap_policy, verify_flows, intake_close (all Claude discretion)

---

## UAT scope

| Option | Description | Selected |
|--------|-------------|----------|
| v1.5 only (22–26 + Phase 19 purge) | Matches milestone; closes UAT-01 | ✓ |
| Include all legacy UAT (04, 07, …) | Would delay v1.5 indefinitely | |
| Automated-only, no manual | Insufficient for FOOT/homepage/visual | |

**User's choice:** «роби все на свій вибір» — Claude selected v1.5 + Phase 19 purge; legacy 04/07 deferred.

---

## Checklist artifact

| Option | Description | Selected |
|--------|-------------|----------|
| Recreate `19-MANUAL-CHECKLIST.md` in phase 27 + master `27-MANUAL-CHECKLIST.md` | Satisfies ROADMAP #1; single operator entry point | ✓ |
| Hunt archived phase-19 directory | Not available in repo | |

---

## DB setup

| Option | Description | Selected |
|--------|-------------|----------|
| Documented purge+seed once per session | Reproducible empty + catalog blocks | ✓ |
| Use only current dev DB without purge | Harder to verify empty-state | |

**Notes:** Store settings survive purge — documented as expected.

---

## Gap policy

| Option | Description | Selected |
|--------|-------------|----------|
| P0 block / P1 fix in phase / P2 defer | Balanced ship criteria | ✓ |
| Zero gaps required | Unrealistic for manual UAT | |

---

## Verify flows

| Option | Description | Selected |
|--------|-------------|----------|
| Manual checklist: guest checkout, admin orders, purge, 22–26 surfaces | ROADMAP smoke + requirements | ✓ |
| `/gsd-verify-work` required first | Optional after checklist | |

---

## Intake closure

| Option | Description | Selected |
|--------|-------------|----------|
| Mark BUG-18…23 verified when UAT passes | Closes v1.5 intake file | ✓ |
| Leave intake open | Would leave false open bugs | |

---

## Claude's Discretion

All six gray areas — user explicitly deferred.

## Deferred Ideas

- Purge including store settings tables
- Legacy phase 04/07 UAT closure
- E2E automation for checkout
