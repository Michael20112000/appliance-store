# Milestones

## v1.0 Appliance Store MVP (Shipped: 2026-05-17)

**Phases completed:** 6 phases, 36 plans, 43 tasks

**Key accomplishments:**

- cloudinary@2.10.0 with fail-fast server config and admin-only POST /api/upload/sign for CldUploadWidget signed uploads
- Ukrainian admin category CRUD at `/admin/kategorii` with guarded delete, uk slug helpers, and storefront cache revalidation
- Ukrainian admin product CRUD at `/admin/tovary` with signed Cloudinary multi-image upload, cart/order delete guards, and storefront cache revalidation
- Admin order management at `/admin/zamovlennia` with linear status transitions, cancel inventory revert, and Ukrainian UI
- Admin dashboard with live stats, full sidebar shell, disabled Чати nav, and green RBAC/CRUD e2e smoke.
- Prisma Conversation/Message with migrated schema, tested chat.service (DB-first, 20/min rate limit), and Pusher singletons with optional env keys
- assertBuyerApi plus POST/GET messages and Pusher channel auth — DB-first send, secured private channels, 19 route tests
- Global buyer chat widget — FAB, panel, Pusher live append, PDP/kabinet entry points, guest login gate
- Admin split inbox at /admin/chaty — enabled Чати nav with unread badge, Pusher live thread, STORE replies
- Playwright suite for chat auth, persistence, PDP context, admin inbox — CI-safe without Pusher secrets
- GitHub Actions gate on main: lint, Vitest, and full Playwright e2e/ on localhost with Neon CI-branch secrets documented for operators.
- Playwright covers full buyer purchase path and automated SEO checks (uk lang, used-product JSON-LD, sitemap sold exclusion).
- App Router `robots.txt` blocks `/admin` and `/api/` with sitemap link; Vercel production env checklist and `.env.example` Production section in Ukrainian.
- Manual launch gate template filled; PERF-01 code review pass; operator approved CWV deferral on dev lab with preview re-run before prod.
- Remote-ready smoke spec (4 tests) and ordered deploy runbook; smoke green on localhost; production re-run documented.
- Removed duplicate Geist font, lazy-loaded chat UI, stabilized catalog thumbnails; docs updated for preview/prod lab; build and tests green.
- Preview live at `https://project-r4qzr.vercel.app`. Smoke 4/4 green. Mobile Lighthouse fail — production promote blocked.
- Recorded live origin, env verification note, and green Playwright smoke against `https://project-r4qzr.vercel.app`.
- Fixed mobile chat Sheet so message history scrolls with touch and close is a single header X.

**Known deferred items at close:** 4 (see STATE.md Deferred Items) — CWV Lighthouse, Phase 04 human UAT partial, stale verification docs.

**Known gaps (accepted tech debt):**

- Mobile Lighthouse on preview: LCP/CLS above v1 targets (documented in 06-VERIFICATION.md)
- REQUIREMENTS.md traceability was not checkbox-synced before archive (shipped features validated in PROJECT.md)

---
