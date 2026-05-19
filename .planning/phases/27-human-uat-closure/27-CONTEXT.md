# Phase 27: Human UAT closure - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Mode:** Operator deferred to Claude (`роби все на свій вибір`)

<domain>
## Phase Boundary

Close **UAT-01** for milestone v1.5: operator runs structured manual verification, documents pass/fail, and clears v1.5 intake debt. This phase is **quality / verification**, not new product features.

**In scope:**
- Recreate or consolidate **`19-MANUAL-CHECKLIST.md`** (referenced in ROADMAP; original phase-19 dir archived) as purge + empty-state + admin-route checks.
- Execute **v1.5 smoke** from ROADMAP: guest checkout, admin orders (delivery-aware status), purge empty-state tolerance.
- Close **pending human checks** from phases **22–26** (especially `25-HUMAN-UAT.md` pending items; optional items from `26-VERIFICATION.md`).
- Mark **`bugfix-intake-2026-05-19-v1.5.md`** rows BUG-18…23 verified when matching UAT lines pass.
- Update **HUMAN-UAT** / **VERIFICATION** frontmatter and **REQUIREMENTS.md** UAT-01 when done.

**Out of scope:**
- Legacy UAT debt from **phases 04, 07** (v1.0/v1.1) — remain in STATE.md deferred; do not block v1.5 ship.
- New features (reviews, SEO, payment, CAPTCHA, email on callback).
- Full regression of entire v1.0–v1.4 catalog (only smoke + v1.5 surfaces).
- Automated Playwright/Cypress suite (unless planner adds minimal scripts — default is manual checklist + existing `npm test` / `npm run build` gate).

</domain>

<decisions>
## Implementation Decisions

### UAT scope (what “closed” means)
- **D-01:** **v1.5 is the closure target.** All verification artifacts for phases **22, 23, 24, 26** already `passed`; phase **25** is `human_needed` — must complete its HUMAN-UAT items in this phase.
- **D-02:** **Phase 19 purge UAT** is required via a dedicated checklist file in this phase directory (see D-04), not hunting archived phase-19 folders.
- **D-03:** **Legacy phases 04, 07, 18** partial UAT/verification gaps stay **deferred** — note in `27-UAT-REPORT.md` (or SUMMARY) as acknowledged; do not expand scope.

### Gap severity policy
- **D-04:** **P0 (block UAT-01):** HTTP 5xx, crash, guest checkout broken, admin cannot log in, illegal order status persisted despite ORD-04.
- **D-05:** **P1 (fix in Phase 27 if ≤30 min):** Wrong UI copy, missing badge, failed manual step for v1.5 requirement already implemented in code.
- **D-06:** **P2 (defer):** seed.test DB state, Cloudinary orphans after purge, legacy milestone UAT, nice-to-have polish.

### Test database setup
- **D-07:** Run UAT on **local/dev** against Neon (or local Postgres) with a **documented baseline**: optional `npm run db:purge` + `npx prisma db seed` **once per session** before purge/empty-state block; real-catalog block may use **seeded** data without purge.
- **D-08:** **`db:purge` does not delete** `StorePhone`, `StoreEmail`, `StoreAddress`, `CallbackRequest` (by design). Empty-state UAT expects **no catalog/orders** empty UX, not necessarily blank footer contacts — footer may still show operator-configured contacts after purge.
- **D-09:** Document exact commands in checklist: `CONFIRM_DB_PURGE=yes npm run db:purge`, then `npx prisma db seed` when catalog data needed.

### Checklist artifacts
- **D-10:** Create **`27-MANUAL-CHECKLIST.md`** — single master operator checklist (ordered sections: environment → purge/empty → smoke → v1.5 features 22–26 → sign-off).
- **D-11:** Create **`19-MANUAL-CHECKLIST.md`** in this phase dir — **purge & empty-state section only** (satisfies ROADMAP success criterion #1 by name); content derived from `prisma/purge-business-data.ts`, DATA-01/DATA-02, and storefront/admin routes that must not 500 with zero products.
- **D-12:** Do **not** duplicate full text from every phase HUMAN-UAT — master checklist links to `24-HUMAN-UAT.md`, `25-HUMAN-UAT.md`, and new `26-HUMAN-UAT.md` with pass/fail checkboxes.

### Execution method
- **D-13:** Primary execution = **operator manual** in browser (desktop + one mobile viewport for drawer/footer).
- **D-14:** Gate before sign-off: `npm test` and `npm run build` green (same as D-23 pattern); known flaky `prisma/seed.test.ts` out-of-stock count documented as P2 if still failing.
- **D-15:** **`/gsd-verify-work 27`** is **optional follow-up** after checklist — use only if operator wants conversational walkthrough of failures; not a blocker for plan execution.

### Critical flows (minimum smoke)
- **D-16:** **Guest checkout:** guest cart → `/koszyk` → checkout → confirmation with order number.
- **D-17:** **Admin orders:** list + detail; pickup order cannot select «Доставляється»; Lviv delivery cannot select «Готово до самовивозу»; invalid transition rejected (ORD-03/04).
- **D-18:** **Purge empty state:** after purge, `/`, `/katalog`, `/admin/kategorii`, `/admin/tovary` load without error; sensible empty copy.
- **D-19:** **Homepage categories (HOME-03):** after purge/seed with no in-stock products, no orphan `#kategorii` block on `/`.
- **D-20:** **Footer & mobile (FOOT-01…04):** contacts from `/admin/nalashtuvannia`, callback toast + rate limit, drawer badges + shared form.

### Intake & tracking closure
- **D-21:** When a checklist section passes, update **`bugfix-intake-2026-05-19-v1.5.md`** matching BUG row to `verified` (BUG-18…23).
- **D-22:** On phase complete: `gsd-sdk query phase.complete 27`, UAT-01 checked in REQUIREMENTS.md, move intake todo to `completed` if fully verified.
- **D-23:** Produce **`27-UAT-REPORT.md`** (or plan SUMMARY) with: date, DB baseline, per-section pass/fail, P1 fixes applied, P2 deferred list.

### Claude's Discretion
- Exact checklist wording and step order in planner.
- Whether to add `26-HUMAN-UAT.md` from VERIFICATION human section vs inline in master checklist.
- Small code fixes for P1 gaps discovered during UAT (within phase 27 plans).

### Folded Todos
- **`bugfix-intake-2026-05-19-v1.5.md`** — closure of BUG-18…23 is part of UAT-01 sign-off (D-21).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 27 success criteria
- `.planning/REQUIREMENTS.md` — UAT-01
- `.planning/STATE.md` — deferred UAT items (04, 07, 19)
- `.planning/PROJECT.md` — v1.5 goal, operator workflow

### Intake & workflows
- `.planning/todos/pending/bugfix-intake-2026-05-19-v1.5.md` — BUG-18…23 traceability
- `.planning/BUGFIX-WORKFLOW.md` — intake → verify pattern

### Purge & data
- `prisma/purge-business-data.ts` — purge scope and confirm flags
- `package.json` scripts `db:purge`, prisma seed entry

### v1.5 phase verification (automated baseline)
- `.planning/phases/22-delivery-aware-order-status/22-VERIFICATION.md`
- `.planning/phases/23-admin-category-polish/23-VERIFICATION.md`
- `.planning/phases/24-product-edit-auto-save-ux/24-VERIFICATION.md` — `24-HUMAN-UAT.md` (resolved)
- `.planning/phases/25-homepage-empty-categories/25-VERIFICATION.md` — `25-HUMAN-UAT.md` (pending)
- `.planning/phases/26-footer-mobile-contact/26-VERIFICATION.md` — optional human section

### Historical
- `.planning/milestones/v1.3-ROADMAP.md` — Phase 19 original scope (DATA-01/02)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `npm test`, `npm run build` — automated gate before human sign-off.
- `npm run db:purge` + `npx prisma db seed` — operator baseline commands.
- Per-phase `*-HUMAN-UAT.md` template (24 resolved, 25 pending) — same frontmatter/Tests structure.

### Established Patterns
- Verifier marks `human_needed` when browser proof required (25, historically 24).
- Milestone close allows legacy UAT debt documented in STATE without blocking (v1.4 precedent in RETROSPECTIVE.md).

### Purge caveat (phase 26)
- New tables `StorePhone`, `StoreEmail`, `StoreAddress`, `CallbackRequest` are **outside** current `PURGE_STEPS` — contacts/callbacks survive purge; document in checklist expectations (D-08).

</code_context>

<specifics>
## Specific Ideas

- Operator prefers **one master checklist** rather than scattered phase folders.
- Ukrainian UI copy in test steps; match production labels («Передзвоніть мені», «Налаштування», etc.).
- Dev server likely already running (`npm run dev`) — checklist should state base URL (localhost:3000).

</specifics>

<deferred>
## Deferred Ideas

- Extend `db:purge` to wipe callback requests and store contacts — separate hygiene task, not UAT-01.
- Automated E2E for guest checkout — post–v1.5 / v2.
- Close legacy phase 04/07 HUMAN-UAT — future audit milestone, not v1.5.

</deferred>
