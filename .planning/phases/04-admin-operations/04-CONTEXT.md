---
phase: 04-admin-operations
status: ready
created: 2026-05-17
locale: uk
---

# Phase 4 — Context

## Goal

Адміністратор керує категоріями, товарами (кілька фото Cloudinary) і замовленнями через захищену `/admin/*` з українськими URL.

## Success criteria (ROADMAP)

1. Користувач без `role admin` не відкриває `/admin` (server-side).
2. CRUD категорій.
3. CRUD товарів + завантаження кількох фото.
4. Перегляд замовлень і зміна статусу (включно з поверненням `SOLD → AVAILABLE` при скасуванні).

## Scope

| In | Out |
|----|-----|
| AUTH-04, ADM-01–04 | ADM-05 (чат) → Phase 5 |
| Signed Cloudinary upload | Онлайн-оплата, доставка поза Львовом |
| Ukrainian admin routes | Маркетплейс / multi-tenant |

## Locked decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| D-04-01 | Три admin-сервіси: `admin-catalog`, `admin-product`, `admin-order` | Не роздувати `catalog.service` (лише AVAILABLE публічно) |
| D-04-02 | Підпис upload: `POST /api/upload/sign` + `cloudinary` SDK | `CldUploadWidget` потребує HTTP endpoint, не Server Action |
| D-04-03 | Admin URL: `/admin/kategorii`, `/admin/tovary`, `/admin/zamovlennia` | UA convention як storefront |
| D-04-04 | `CANCELLED` → revert linked `productId` з `SOLD` на `AVAILABLE` | Phase 3 defer A4; inventory integrity |
| D-04-05 | `requireAdmin()` у кожній admin action і sign route | Defense in depth (PITFALLS #2) |
| D-04-06 | Nav «Чати» disabled + «Незабаром» | ADM-05 у Phase 5 |
| D-04-07 | `CLOUDINARY_UPLOAD_PRESET` optional; sign route fail-fast on missing API key/secret | RESEARCH Q1 |
| D-04-08 | Hide via `DRAFT`; hard delete only if cart/order guards pass | RESEARCH Q2 |

## Human-verify (optional)

- Cloudinary dashboard: signed upload preset / folder policy після першого deploy.
