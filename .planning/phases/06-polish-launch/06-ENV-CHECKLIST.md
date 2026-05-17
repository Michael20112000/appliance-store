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

Set variables in **Vercel → Project → Settings → Environment Variables** for the **Production** environment only (use Preview for staging).

### Required on production

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Neon **production** branch — pooled (`-pooler`) |
| `DIRECT_URL` | Same branch — direct URL for migrations |
| `BETTER_AUTH_SECRET` | Unique secret ≥ 32 chars; **not** CI/dev value |
| `BETTER_AUTH_URL` | Production origin, e.g. `https://your-domain.com` |
| `NEXT_PUBLIC_APP_URL` | **Must match `BETTER_AUTH_URL` exactly** — same https origin, no trailing slash (D-06-15) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Server-side upload signing |
| `CLOUDINARY_API_SECRET` | Server-side only — never `NEXT_PUBLIC_` |
| `PUSHER_APP_ID` | Pusher app for realtime chat |
| `PUSHER_KEY` | Must equal `NEXT_PUBLIC_PUSHER_KEY` |
| `PUSHER_SECRET` | Server-side only |
| `PUSHER_CLUSTER` | e.g. `eu` — must match `NEXT_PUBLIC_PUSHER_CLUSTER` |
| `NEXT_PUBLIC_PUSHER_KEY` | Client subscribe key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Client cluster |

### Forbidden on production (D-06-14)

| Variable | Reason |
|----------|--------|
| `ADMIN_PASSWORD` | Seed credentials — admin account already in DB; do not deploy seed secrets to prod |
| `ADMIN_EMAIL` (for seed) | Same — use existing production admin user |

### Promote prerequisite (D-06-16)

1. **Preview deployment green** — CI on `main` passed (`npm test`, Playwright on localhost).
2. Manual on preview URL: Lighthouse + SEO checklist (D-06-10–11) — Rich Results, `GET /robots.txt`, `GET /sitemap.xml`.
3. **Then** promote to Production with env vars above verified in Vercel dashboard.

### Post-launch (out of scope)

- **Google Search Console** setup (D-06-12) — owner after production deploy, not blocking this phase.

### Cross-reference

- CI secrets and local gate: [§ GitHub Actions CI](#github-actions-ci) (plan 06-01).
- `.env.example` **Production** section: Ukrainian comments for required/forbidden vars (D-06-18).
