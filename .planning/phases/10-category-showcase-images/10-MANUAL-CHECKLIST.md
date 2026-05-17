# Phase 10 — Category Showcase Images: Manual Checklist

**Purpose:** Human verification for homepage category cards and admin image flow (D-10-14, HOME-01, HOME-02).

**Status:** ⏳ Pending operator sign-off

**Automated gates (recorded at plan 10-04 execution):**
```bash
npm test
# Record result below after operator re-runs if needed
```
**Vitest:** ✅ `npm test` passed at 10-04 plan execution (executor)

**Prerequisites:**
- `npm run dev` running locally
- Cloudinary env configured (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, upload sign route)
- Admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD` or seeded admin)
- At least one category **without** `imagePublicId` (fresh DB or cleared image) for placeholder test

---

## Homepage placeholder (D-10-06)

| # | Step | Expected | Pass |
|---|------|----------|------|
| 1 | Open `/` (homepage) | Category grid renders; cards **without** `imagePublicId` show muted area with text **«Без фото»** | ☐ |
| 2 | Confirm grid layout | Still **2 cols mobile / 4 cols md**; links go to `/katalog/{slug}`; titles under image | ☐ |

---

## Admin upload → homepage (D-10-08–11)

| # | Step | Expected | Pass |
|---|------|----------|------|
| 3 | Log in as admin → `/admin/kategorii` → open a category edit | Section **«Зображення категорії»** visible below form | ☐ |
| 4 | Upload image via widget → save/wait for success toast | Preview shows uploaded image on admin page | ☐ |
| 5 | Open `/` (hard refresh if cached) | That category card shows **Cloudinary image** (not placeholder) | ☐ |

---

## Remove image → placeholder (D-10-11)

| # | Step | Expected | Pass |
|---|------|----------|------|
| 6 | On same category admin page, click **«Прибрати фото»** → confirm | Admin preview clears; DB `imagePublicId` null | ☐ |
| 7 | Reload homepage | Card returns to **«Без фото»** placeholder | ☐ |

---

## Regression & a11y

| # | Step | Expected | Pass |
|---|------|----------|------|
| 8 | Categories never uploaded still render | Grid complete; all links work; placeholder only where no image | ☐ |
| 9 | Category with image but **empty** `imageAlt` | DevTools: `img` alt is `{name} — категорія, Львів` (D-10-02 fallback) | ☐ |

---

## Optional dev seed (D-10-12)

| # | Step | Expected | Pass |
|---|------|----------|------|
| 10 | Run `npm run db:seed` on DB with null `imagePublicId` | Categories get seed `imagePublicId` from pool; **re-run does not overwrite** admin-set images | ☐ |
| 11 | Run seed with `SEED_SKIP_IMAGE_UPLOAD=1` | Deterministic `public_id` written without Cloudinary upload (dev only) | ☐ |

---

**Sign-off:** Operator initials / date when all required rows (1–9) pass: _______________
