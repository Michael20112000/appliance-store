This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Continuous Integration

Every push and pull request to `main` runs lint, Vitest, and Playwright against **localhost** (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

Before the first CI run, add these **GitHub Actions** repository secrets (Neon **CI branch** only — never production URLs):

- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

Full setup notes: [`.planning/phases/06-polish-launch/06-ENV-CHECKLIST.md`](.planning/phases/06-polish-launch/06-ENV-CHECKLIST.md).

Local gate (same as phase 6): `npm test && npm run test:e2e`.

## Оператор: очистка БД (dev/staging)

Повне видалення бізнес-даних (каталог, кошики, замовлення, чат) з PostgreSQL. Таблиці Better Auth (**User**, **Session**, **Account**, **Verification**) не чіпаються — адмін лишається з тими ж обліковими даними.

1. **Бекап** — `pg_dump` або Neon branch snapshot (автоматично не робиться).
2. **Purge** — `CONFIRM_DB_PURGE=yes npm run db:purge` (dev/staging). Альтернатива: `npm run db:purge -- --confirm`.
3. **Production** — лише навмисно: додатково `ALLOW_PRODUCTION_PURGE=yes`.
4. **Опційно seed** — окремо `npx prisma db seed` (purge **не** запускає seed). Увага: seed викликає `seedProducts` (80+ товарів і завантаження в Cloudinary), це не «порожня» БД.
5. **Наповнення** — нові товари через `/admin/tovary`; логін адміна без змін, якщо рядки User на місці.
6. **Тести** — `npm test` / `prisma/seed.test.ts` очікують засіяні дані; після purge спочатку `npx prisma db seed`, інакше тести впадуть.

Cloudinary не очищується — зображення в медіатеці можуть лишитися сиротами.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
