# Phase 26: Footer & mobile contact - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 26-footer-mobile-contact
**Areas discussed:** contact source, callback persistence, callback UX, drawer counts, footer layout

---

## Contact source (admin settings)

| Option | Description | Selected |
|--------|-------------|----------|
| Env vars only | STORE_PHONE + STORE_EMAIL | |
| Admin DB page | Phones, emails, addresses in admin | ✓ |
| Claude decides | | |

**User's choice:** Admin page to manage email(s), phone(s), address(es). Not env-primary.

**Notes:** Multiple entries per type allowed. Empty admin fields → nothing on storefront.

---

## Missing contact values

| Option | Description | Selected |
|--------|-------------|----------|
| Hide row | Omit unset types | ✓ |
| Placeholder | «Незабаром» | |
| Claude decides | | |

**User's choice:** Do not show empty contact types on frontend.

---

## Phone display

| Option | Description | Selected |
|--------|-------------|----------|
| tel: + human format | Clickable + formatted display | ✓ |
| Raw env text | | |
| Claude decides | | |

---

## Address & map

| Option | Description | Selected |
|--------|-------------|----------|
| Full address + click opens map + lazy embed | Кавалерідзе 19 example | ✓ |
| Short «м. Львів» only | | |
| Claude decides | | |

**Notes:** External map on address click; mini-map iframe always in footer, lazy-loaded below fold for PageSpeed.

---

## Callback persistence

| Option | Description | Selected |
|--------|-------------|----------|
| DB + admin list on settings page | | ✓ |
| DB only, no admin UI | | |
| Toast only, no persistence | | |

---

## Callback auth

| Option | Description | Selected |
|--------|-------------|----------|
| Guest | No login | ✓ |
| Logged-in only | | |

---

## Callback success feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Toast + clear field | «Дякуємо, передзвонимо» | ✓ |
| Inline only | | |

---

## Callback spam protection

| Option | Description | Selected |
|--------|-------------|----------|
| None | | |
| Rate limit per IP | N/hour on server action | ✓ |

---

## Callback copy & component

| Option | Description | Selected |
|--------|-------------|----------|
| REQUIREMENTS copy | «Вкажіть свій номер — ми передзвонимо» | ✓ |
| Button «Передзвоніть мені» | | ✓ |
| Shared CallbackRequestForm | Footer + drawer | ✓ |
| Inline errors only | No error toast | ✓ |

---

## Drawer category counts (FOOT-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Muted badge right | | ✓ |
| Parentheses inline | | |
| Hide zero categories | Already filtered | ✓ |
| uaPhoneSchema | Same as checkout | ✓ |

---

## Footer layout

| Option | Description | Selected |
|--------|-------------|----------|
| Desktop two-column | Contacts/map left, form right | ✓ |
| Drawer order | Categories → separator → form | ✓ |
| Keep © footer | | ✓ |
| Lazy map always visible | Below fold iframe | ✓ |

---

## Claude's Discretion

- Prisma schema shape, admin slug, map provider, rate-limit N, env deprecation strategy.

## Deferred Ideas

- Email notification on new callback.
- Contacts section inside mobile drawer.
- CAPTCHA beyond rate limit.
