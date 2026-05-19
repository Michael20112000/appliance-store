# Phase 16: Shadcn Select Audit & Verify - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 16-Shadcn Select Audit & Verify
**Areas discussed:** Select migration pattern, Select UX, Gallery verify (POL-01), Slug policy (POL-02), Grep audit scope

---

## Select migration pattern

| Option | Description | Selected |
|--------|-------------|----------|
| nuqs controlled | Select + onValueChange → setParams for catalog | ✓ |
| RHF on catalog | react-hook-form for toolbar/filters | |
| Controller + Select | RHF Controller for product-form fields | ✓ |
| register() hack | Hidden input + Select UI only | |
| No shared wrapper | Inline Select in product-form (YAGNI) | ✓ |
| FormSelectField wrapper | Reusable admin form select | |

**User's choice:** Catalog = nuqs controlled; product-form = Controller; no shared wrapper.
**Notes:** Aligns with OrderListStatusSelect pattern for catalog; standard shadcn+RHF for admin form.

---

## Select UX

| Option | Description | Selected |
|--------|-------------|----------|
| Compact fixed toolbar | ~w-36 sort select in toolbar | ✓ |
| Full width filters | Brand select w-full in sidebar | ✓ |
| SelectItem «Усі бренди» | Sentinel item → brend null in nuqs | ✓ |
| Placeholder-only clear | No «all brands» item | |

**User's choice:** Compact toolbar; full-width brand filter; explicit «Усі бренди» SelectItem.

---

## Gallery verify (POL-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Manual + fix blockers | Checklist + fix only blocking bugs | ✓ |
| Manual only | No code changes unless critical | |
| Tap + arrows | Dialog navigation; swipe not required | ✓ |
| Swipe required | Touch swipe mandatory | |
| Manual checklist only | No playwright for gallery | ✓ |
| Playwright smoke | Automated dialog test | |

**User's choice:** Manual checklist with blocker fixes; tap/arrows sufficient; no e2e this phase.

---

## Slug policy (POL-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Immutable on edit | No slug input ever; read-only URL on edit | ✓ |
| Edit override | Allow manual slug change on edit | |
| Hint on create | «URL згенерується з назви» under title/name | ✓ |
| Silent | No hint | |
| grep src/components | ROADMAP scope for `<select>` audit | ✓ |
| grep all src | Entire src tree | |

**User's choice:** Slug never editable in UI; hint on create; grep limited to `src/components`.

---

## Claude's Discretion

- UA copy for slug hint
- Optional Vitest for catalog Select
- SelectGroup usage in product-form

## Deferred Ideas

- Playwright gallery smoke
- FormSelectField wrapper
- Mandatory swipe in gallery
- Full `src/` select grep beyond ROADMAP
