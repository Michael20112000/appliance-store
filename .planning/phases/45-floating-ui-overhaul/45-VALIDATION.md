---
phase: 45
slug: floating-ui-overhaul
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-24
---

# Phase 45 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npm test -- --reporter=verbose src/components/layout/callback-request-form.test.tsx src/components/layout/storefront-fabs.test.tsx` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --reporter=verbose src/components/layout/callback-request-form.test.tsx src/components/layout/storefront-fabs.test.tsx`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 45-01-01 | 01 | 1 | FAB-03 | — | Phone field shows NO error while typing partial number ("097") | unit | `npm test -- src/components/layout/callback-request-form.test.tsx` | ✅ extend existing | ⬜ pending |
| 45-01-02 | 01 | 1 | FAB-03 | — | Phone field shows error AFTER failed submit with short number | unit | `npm test -- src/components/layout/callback-request-form.test.tsx` | ✅ extend existing | ⬜ pending |
| 45-02-01 | 02 | 2 | FAB-04 | — | ChatFab slot renders inside StorefrontFabs (not separately) | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | ✅ extend existing | ⬜ pending |
| 45-02-02 | 02 | 2 | FAB-04 | — | Chat button hidden when chat `isOpen=true` | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | ✅ extend existing | ⬜ pending |
| 45-02-03 | 02 | 2 | FAB-04 | — | Chat button visible when `isOpen=false` | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | ✅ extend existing | ⬜ pending |
| 45-02-04 | 02 | 2 | FAB-04 | — | FAB wrapper className includes `right-6` (not `left-6`) | unit (class check) | `npm test -- src/components/layout/storefront-fabs.test.tsx` | ✅ extend existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/layout/callback-request-form.test.tsx` — add test: typing partial number should NOT show validation error before submit
- [ ] `src/components/layout/storefront-fabs.test.tsx` — add tests: chat button renders, hidden when `chatIsOpen=true`, FAB wrapper className includes `right-6`
- [ ] `src/components/layout/storefront-fabs.test.tsx` — add mock: `@/components/chat/chat-provider` providing `useChat` stub

Required mock for `storefront-fabs.test.tsx`:
```ts
vi.mock("@/components/chat/chat-provider", () => ({
  useChat: vi.fn().mockReturnValue({
    isOpen: false,
    openPanel: vi.fn(),
    unreadFromStore: false,
    hasSession: false,
  }),
}));
```

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Callback dialog visually covers FAB group when open | FAB-04 | CSS stacking context (z-49 FABs under z-50 dialog) is deterministic but visual confirmation needed | Open callback dialog; verify no FABs visible through backdrop |
| FABs appear in correct vertical order: callback (top) → cart (middle) → chat (bottom) | FAB-04 | Layout order is visual | Inspect bottom-right corner on storefront page |
| Chat button disappears when chat panel opens | FAB-04 | Integration behavior across context boundary | Open chat panel; verify chat FAB hidden |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
