# Phase 6: Polish & Launch - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 6-Polish & Launch
**Areas discussed:** E2E gate, Performance/CWV, SEO verification, Production deploy & smoke, Launch cut line, CI/PR gate

---

## E2E gate

| Option | Description | Selected |
|--------|-------------|----------|
| Smoke only | `smoke-deploy.spec.ts` before launch | |
| Full `e2e/` suite | All specs green; optional skips for Pusher/Cloudinary | ✓ |
| Single monolithic journey | One spec replaces all | |
| Separate specs + critical journey | Keep domain specs; add one happy-path checkout journey | ✓ |

**User's choice:** На розсуд Claude (delegated)
**Notes:** Locked as D-06-01…D-06-05. Critical journey added without merging admin/chat into same file.

---

## Performance / CWV

| Option | Description | Selected |
|--------|-------------|----------|
| Lighthouse CI on every PR | Automated perf regression | |
| Manual mobile Lighthouse on 3 URLs | Lab gate before prod promote | ✓ |
| No formal targets | Ship when «feels fast» | |
| LCP ≤2.5s, CLS ≤0.1, INP ≤200ms | Documented v1 targets | ✓ |

**User's choice:** На розсуд Claude (delegated)
**Notes:** D-06-06…D-06-09. No Lighthouse CI for v1.

---

## SEO verification

| Option | Description | Selected |
|--------|-------------|----------|
| Manual only | Rich Results + eyeball sitemap | |
| Automated e2e + manual Rich Results | Strengthen catalog-seo; manual PDP/home | ✓ |
| GSC setup in phase | Search Console property | |
| Defer all SEO | Trust Phase 2 only | |

**User's choice:** На розсуд Claude (delegated)
**Notes:** D-06-10…D-06-13. GSC deferred post-launch.

---

## Production deploy & smoke

| Option | Description | Selected |
|--------|-------------|----------|
| Deploy without checklist | Trust Vercel defaults | |
| Env checklist + preview gate + prod smoke | Documented promote flow | ✓ |
| Smoke only on localhost | No prod URL tests | |
| `PLAYWRIGHT_BASE_URL` prod smoke | Post-deploy against production | ✓ |

**User's choice:** На розсуд Claude (delegated)
**Notes:** D-06-14…D-06-18. Expand smoke routes in implementation.

---

## Launch cut line

| Option | Description | Selected |
|--------|-------------|----------|
| Friends-only beta | Hidden launch | |
| Public catalog launch | Full MVP visible | ✓ |
| Block on Sentry + legal | Enterprise gate | |
| Ship without Sentry/legal | Pragmatic v1 | ✓ |

**User's choice:** На розсуд Claude (delegated)
**Notes:** D-06-19…D-06-22. Minimal robots.ts if missing.

---

## CI / PR gate

| Option | Description | Selected |
|--------|-------------|----------|
| No CI | Local-only before deploy | |
| GitHub Actions: lint + unit + e2e localhost | PR/push gate | ✓ |
| E2E on Vercel preview in CI | Deploy preview per PR | |
| Localhost CI only | Preview smoke manual | ✓ |

**User's choice:** На розсуд Claude (delegated)
**Notes:** D-06-23…D-06-26.

---

## Claude's Discretion

All six areas delegated with «на твій розсуд». Decisions D-06-01 through D-06-26 recorded in `06-CONTEXT.md`.

## Deferred Ideas

- Sentry, legal pages, GSC, Lighthouse CI, NOTF email — see CONTEXT.md `<deferred>`
