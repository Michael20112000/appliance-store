# Phase 6 — Environment checklist

## GitHub Actions CI

Workflow: [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) — runs on every `push` and `pull_request` to `main`.

### Required GitHub Secrets

Configure in **GitHub → Settings → Secrets and variables → Actions** (repository secrets):

| Secret | Notes |
|--------|--------|
| `DATABASE_URL` | Neon **CI branch** pooled connection string (`-pooler`) |
| `DIRECT_URL` | Same CI branch — direct (non-pooler) URL for `prisma migrate deploy` |
| `BETTER_AUTH_SECRET` | Random string ≥ 32 characters; **not** the production secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (dev or dedicated CI cloud) |

**Forbidden in GitHub Actions:** production Neon connection strings, production `BETTER_AUTH_SECRET`, or any production-only URLs. CI uses `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` = `http://localhost:3000` inside the workflow.

### Optional secrets (E2E may skip)

| Secret | Effect if missing |
|--------|-------------------|
| Pusher (`PUSHER_*`, `NEXT_PUBLIC_PUSHER_*`) | `e2e/chat-realtime.spec.ts` skips via `test.skip()` |
| Cloudinary API (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) | Admin sign-upload test in `admin-rbac` skips |

Skipped optional specs do **not** fail CI (D-06-24).

### Local phase gate

Before merging phase 6 work:

```bash
npm test && npm run test:e2e
```

Same contract as CI: full `e2e/` on localhost (`playwright.config.ts` `webServer`), not a Vercel preview URL.

## Production (Vercel)

_Completed in plan 06-03._
