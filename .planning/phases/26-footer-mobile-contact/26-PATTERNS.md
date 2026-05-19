# Phase 26: Footer & mobile contact - Pattern Map

**Mapped:** 2026-05-19  
**Files analyzed:** 24 (18 implementation + 6 test)  
**Analogs found:** 22 / 24

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | model | CRUD | `Category` model (`sortOrder`, timestamps) | exact |
| `src/server/services/store-settings.service.ts` | service | CRUD | `admin-catalog.service.ts` | exact |
| `src/server/services/callback-request.service.ts` | service | CRUD + batch | `chat.service.ts` (`enforceRateLimit`) | exact |
| `src/server/validators/phone.ts` | utility | transform | `order.ts` (`uaPhoneSchema` private) | exact |
| `src/server/validators/callback.ts` | utility | transform | `order.ts` + `category.ts` object schemas | exact |
| `src/server/validators/admin-store-settings.ts` | utility | transform | `category.ts` (`upsertCategorySchema`) | exact |
| `src/server/validators/order.ts` | utility | transform | self (re-export `uaPhoneSchema`) | exact |
| `src/server/actions/callback.actions.ts` | controller | request-response | `order.actions.ts` (guest, Zod, result union) | exact |
| `src/server/actions/admin/store-settings.actions.ts` | controller | request-response | `category.actions.ts` | exact |
| `src/lib/phone/format-ua.ts` | utility | transform | _(new — no formatter in repo)_ | no analog |
| `src/lib/catalog/store-nap.ts` | utility | CRUD read | `getStoreNap()` + `CategoryGrid` async fetch | role-match |
| `src/components/layout/callback-request-form.tsx` | component | request-response | `checkout-form.tsx` + `product-form.tsx` inline errors | exact |
| `src/components/layout/store-footer.tsx` | component | CRUD read (SSR) | `CategoryGrid` + current `store-footer.tsx` shell | exact |
| `src/components/layout/store-mobile-nav.tsx` | component | request-response | `catalog-filters.tsx` badges + `store-mobile-nav.tsx` Sheet | exact |
| `src/components/admin/store-settings-form.tsx` | component | CRUD | `category-form.tsx` | exact |
| `src/components/admin/callback-requests-table.tsx` | component | CRUD read | `admin-categories-table.tsx` | role-match |
| `src/app/(admin)/admin/nalashtuvannia/page.tsx` | route | CRUD read | `kategorii/page.tsx` | exact |
| `src/components/admin/admin-nav-items.ts` | config | — | existing nav array | exact |
| `src/app/(storefront)/page.tsx` | route | CRUD read | `page.tsx` JsonLd + async `CategoryGrid` | role-match |
| `prisma/seed.ts` | config | batch | `seedCategories()` upsert loop | role-match |
| `src/server/validators/phone.test.ts` | test | — | `order.test.ts` phone cases | exact |
| `src/server/validators/callback.test.ts` | test | — | `category.test.ts` | exact |
| `src/server/services/callback-request.service.test.ts` | test | — | `chat.service.test.ts` rate limit | exact |
| `src/server/services/store-settings.service.test.ts` | test | — | `catalog.service.test.ts` | role-match |
| `src/components/layout/store-mobile-nav.test.tsx` | test | — | `admin-categories-table.test.tsx` | role-match |
| `src/components/layout/callback-request-form.test.tsx` | test | — | `product-edit-delete-button.test.tsx` | exact |

**Path note:** UI-SPEC places `CallbackRequestForm` at `src/components/layout/callback-request-form.tsx` (not `store/`).

---

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD)

**Analog:** `Category` model + research sketch for `CallbackRequest`

**Core model pattern** (lines 99-110):

```99:110:prisma/schema.prisma
model Category {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?
  imagePublicId String?
  imageAlt      String?
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  products      Product[]
}
```

**Rate-limit index pattern** (mirror `Message` composite index, lines 243-253):

```243:253:prisma/schema.prisma
model Message {
  id             String         @id @default(cuid())
  conversationId String
  conversation   Conversation   @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  senderRole     MessageSender
  body           String
  createdAt      DateTime       @default(now())

  @@index([conversationId, createdAt])
}
```

Apply `@@index([ipAddress, createdAt])` on `CallbackRequest` per RESEARCH.

---

### `src/server/validators/phone.ts` (utility, transform)

**Analog:** `src/server/validators/order.ts`

**Extract this schema** (lines 3-6):

```3:6:src/server/validators/order.ts
const uaPhoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10,15}$/, "Вкажіть номер телефону — лише цифри, від 10 до 15");
```

**Re-export from `order.ts`:**

```typescript
export { uaPhoneSchema } from "./phone";
// checkoutSchema keeps: customerPhone: uaPhoneSchema
```

---

### `src/server/validators/callback.ts` (utility, transform)

**Analog:** `src/server/validators/order.ts` object export

```10:18:src/server/validators/order.ts
export const checkoutSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, "Ім'я має містити щонайменше 2 символи")
      .max(100),
    customerPhone: uaPhoneSchema,
    deliveryType: deliveryTypeSchema,
```

```typescript
export const callbackRequestSchema = z.object({ phone: uaPhoneSchema });
export type CallbackRequestInput = z.infer<typeof callbackRequestSchema>;
```

---

### `src/server/validators/admin-store-settings.ts` (utility, transform)

**Analog:** `src/server/validators/category.ts`

**Array + coerce pattern** (lines 8-24):

```8:24:src/server/validators/category.ts
export const upsertCategorySchema = z
  .object({
    name: z.string().trim().min(2, "Вкажіть назву категорії"),
    slug: z.union([slugSchema, z.literal("")]).optional(),
    description: z.union([z.string().trim().max(2000), z.literal("")]).optional(),
    sortOrder: z.coerce
      .number()
      .int("Порядок має бути цілим числом")
      .min(1, "Порядок від 1")
      .default(1),
  })
  .transform((data) => ({
    name: data.name,
    sortOrder: data.sortOrder,
    slug: data.slug === "" ? undefined : data.slug,
    description: data.description === "" ? undefined : data.description,
  }));
```

Use `z.array(...)` for phones/emails/addresses with `sortOrder`, max lengths for XSS-safe strings.

---

### `src/server/services/store-settings.service.ts` (service, CRUD)

**Analog:** `src/server/services/admin-catalog.service.ts`

**List with sortOrder** (lines 63-77):

```63:77:src/server/services/admin-catalog.service.ts
export async function listCategoriesAdmin() {
  const rankRows = await fetchCategoryRankRows();
  const ranks = displayRankById(rankRows);

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });

  return categories.map((category) => ({
    ...category,
    sortOrder: ranks.get(category.id) ?? category.sortOrder,
  }));
}
```

**Public read DTO:** `getPublicStoreContacts()` — `findMany` per table, `orderBy: [{ sortOrder: "asc" }, { id: "asc" }]`, omit empty types in mapper (D-03).

---

### `src/server/services/callback-request.service.ts` (service, CRUD + batch)

**Analog:** `src/server/services/chat.service.ts`

**Custom error classes** (lines 24-41):

```24:41:src/server/services/chat.service.ts
export class ChatServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

export class ChatRateLimitError extends ChatServiceError {
  constructor() {
    super(
      CHAT_RATE_LIMIT,
      "Занадто багато повідомлень. Спробуйте через хвилину.",
    );
    this.name = "ChatRateLimitError";
  }
}
```

**DB rate limit** (lines 162-174):

```162:174:src/server/services/chat.service.ts
async function enforceRateLimit(senderId: string) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recent = await prisma.message.count({
    where: {
      senderId,
      createdAt: { gte: since },
    },
  });

  if (recent >= RATE_LIMIT_MAX) {
    throw new ChatRateLimitError();
  }
}
```

Mirror with `CallbackRequest` + `ipAddress`; use `CALLBACK_RATE_LIMIT_WINDOW_MS = 3_600_000`, `CALLBACK_RATE_LIMIT_MAX = 5`.

**IP helper (new, no analog):** `headers()` from `next/headers`, first IP from `x-forwarded-for?.split(",")[0]?.trim()` or `x-real-ip`.

---

### `src/server/actions/callback.actions.ts` (controller, request-response)

**Analog:** `src/server/actions/order.actions.ts`

**Guest action + Zod + result union** (lines 28-67):

```28:67:src/server/actions/order.actions.ts
export async function submitCheckoutAction(input: unknown) {
  const cookieStore = await cookies();

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      const data = checkoutSchema.parse(input);
      const { orderNumber } = await createOrderFromCart(session.user.id, data);
      revalidatePath("/koszyk");
      revalidatePath("/kabinet");
      revalidatePath("/", "layout");
      redirect(`/zamovlennia/pidtverdzhennia/${orderNumber}`);
    }

    const data = guestCheckoutSchema.parse(input);
    const { orderNumber, guestAccessToken } =
      await createOrderFromGuestCart(data);
    // ...
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ZodError) {
      return { ok: false as const, error: "VALIDATION" as const };
    }
```

Callback: no auth, no redirect; return `{ ok: true } | { ok: false, error: "VALIDATION" | "RATE_LIMIT" | "UNKNOWN", message?: string }`; map `CallbackRateLimitError` to `RATE_LIMIT`.

---

### `src/server/actions/admin/store-settings.actions.ts` (controller, request-response)

**Analog:** `src/server/actions/admin/category.actions.ts`

**Admin gate + parse + revalidate** (lines 42-68):

```42:68:src/server/actions/admin/category.actions.ts
export async function createCategoryAction(input: unknown) {
  await requireAdmin();
  const data = upsertCategorySchema.parse(input);

  try {
    const category = await createCategory(data);
    revalidateCategoryPaths(category.slug);
    redirect(`/admin/kategorii/${category.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return mapCategoryError(error);
  }
}

export async function updateCategoryAction(input: unknown) {
  await requireAdmin();
  const data = updateCategorySchema.parse(input);

  try {
    const category = await updateCategory(data);
    revalidateCategoryPaths(category.slug);
    return { ok: true as const };
  } catch (error) {
    return mapCategoryError(error);
  }
}
```

**Revalidate storefront footer** after settings save:

```typescript
revalidatePath("/", "layout");
revalidatePath("/admin/nalashtuvannia");
```

(same as `order.actions.ts` line 39 / `product.actions.ts` line 30).

---

### `src/lib/phone/format-ua.ts` (utility, transform)

**Analog:** None in codebase

**Planner:** Implement per RESEARCH `formatUaPhoneDisplay` / `uaPhoneTelHref`; no `libphonenumber-js`. Normalize digits same as checkout storage (10-digit UA starting with `0` → E.164 `38...`).

---

### `src/lib/catalog/store-nap.ts` (utility, CRUD read)

**Analog:** `src/components/home/category-grid.tsx` (async service delegation)

**Current (replace env read):**

```3:9:src/lib/catalog/store-nap.ts
export function getStoreNap() {
  const env = getEnv();
  return {
    name: "Техніка б/у Львів",
    address: env.STORE_ADDRESS,
    phone: env.STORE_PHONE,
  };
}
```

**Target pattern:**

```13:16:src/components/home/category-grid.tsx
export async function CategoryGrid() {
  const { categories: categoriesWithCounts } =
    await listCategoriesWithProductCounts();
```

```typescript
export async function getStoreNap() {
  const contacts = await getPublicStoreContacts(); // store-settings.service
  return {
    name: "Техніка б/у Львів",
    address: contacts.primaryAddress?.text,
    phone: contacts.primaryPhone?.digits,
  };
}
```

Update `src/app/(storefront)/page.tsx` to `await getStoreNap()` (homepage is already a Server Component).

---

### `src/components/layout/callback-request-form.tsx` (component, request-response)

**Analog:** `checkout-form.tsx` (phone field) + `product-form.tsx` (inline errors, no top Alert for field errors)

**Imports + form setup** (lines 1-32):

```1:32:src/components/checkout/checkout-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/server/validators/order";
import { submitCheckoutAction } from "@/server/actions/order.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ...
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: defaultName,
      customerPhone: "",
```

**Phone field** (lines 70-79):

```70:79:src/components/checkout/checkout-form.tsx
      <div className="space-y-2">
        <Label htmlFor="customerPhone">Телефон</Label>
        <Input
          id="customerPhone"
          type="tel"
          placeholder="0978734712"
          inputMode="numeric"
          maxLength={15}
          {...form.register("customerPhone")}
        />
```

**Inline error (not checkout top Alert)** — copy from `product-form.tsx` (lines 150-154):

```150:154:src/components/admin/product-form.tsx
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
```

**Success toast** — `product-edit-delete-button.tsx` pattern:

```typescript
import { toast } from "sonner";
// on result.ok:
toast.success("Дякуємо, передзвонимо");
form.reset({ phone: "" });
// on failure — form.setError("phone", { message }) ONLY; never toast.error (D-13)
```

**Submit button** (lines 124-126):

```124:126:src/components/checkout/checkout-form.tsx
      <Button type="submit" className="min-h-11 w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Оформлюємо…" : "Підтвердити замовлення"}
      </Button>
```

Use label «Передзвоніть мені»; props: `idPrefix?`, `compact?`, `className?` per UI-SPEC.

---

### `src/components/layout/store-footer.tsx` (component, CRUD read SSR)

**Analog:** `CategoryGrid` (async data) + existing footer shell

**Keep shell** (lines 1-12):

```1:12:src/components/layout/store-footer.tsx
export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-medium text-foreground">м. Львів</p>
        <p>Телефон і email — незабаром</p>
        <p>© {year} Техніка б/у Львів</p>
      </div>
    </footer>
  );
}
```

**Target:** `export async function StoreFooter()`; `await getPublicStoreContacts()`; grid `grid gap-8 md:grid-cols-2 md:gap-12`; left column conditional `<ul>` blocks; lazy `<iframe loading="lazy" title="Карта магазину" />`; right `<CallbackRequestForm />`; copyright `border-t pt-6 mt-8` (UI-SPEC). Remove stub lines.

---

### `src/components/layout/store-mobile-nav.tsx` (component, request-response)

**Analog:** `catalog-filters.tsx` (badge) + existing Sheet

**Sheet structure** (lines 34-59):

```34:59:src/components/layout/store-mobile-nav.tsx
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="md:hidden"
        render={<Button variant="outline" size="icon" aria-label="Меню" />}
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Категорії</SheetTitle>
        </SheetHeader>
        <ul className="mt-4 flex flex-col gap-2 pl-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/katalog/${category.slug}`}
                className="block min-h-11 py-2 text-sm"
```

**Badge pattern** (lines 207-216):

```207:216:src/components/catalog/catalog-filters.tsx
              <Link
                href={`/katalog/${cat.slug}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted",
                  activeCategorySlug === cat.slug && "bg-muted font-medium",
                )}
              >
                <span>{cat.name}</span>
                <Badge variant="secondary">{cat.productCount}</Badge>
              </Link>
```

**Drawer row (FOOT-04):**

```tsx
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CallbackRequestForm } from "@/components/layout/callback-request-form";

<Link className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-sm" ...>
  <span className="truncate">{category.name}</span>
  <Badge variant="secondary" className="shrink-0 tabular-nums text-muted-foreground">
    {category.productCount}
  </Badge>
</Link>
// after </ul>:
<Separator className="my-6" />
<CallbackRequestForm compact idPrefix="drawer" />
```

Categories already filtered in `store-header.tsx` (lines 15-18):

```15:18:src/components/layout/store-header.tsx
  const { categories: categoriesWithCounts } =
    await listCategoriesWithProductCounts();
  const availableCategories =
    categoriesWithAvailableProducts(categoriesWithCounts);
```

---

### `src/components/admin/store-settings-form.tsx` (component, CRUD)

**Analog:** `src/components/admin/category-form.tsx`

**Client form + server action** (lines 1-73):

```1:18:src/components/admin/category-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/server/actions/admin/category.actions";
import {
  upsertCategorySchema,
  type UpsertCategoryInput,
} from "@/server/validators/category";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
```

Admin settings may use **repeatable field arrays** (planner discretion); top `Alert` for save errors is OK here (unlike callback form).

---

### `src/components/admin/callback-requests-table.tsx` (component, CRUD read)

**Analog:** `src/components/admin/admin-categories-table.tsx`

**Table shell** (lines 29-38):

```29:38:src/components/admin/admin-categories-table.tsx
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium">Назва</th>
            <th className="px-4 py-2 font-medium">Товари</th>
            <th className="px-4 py-2 font-medium">Порядок</th>
          </tr>
        </thead>
```

Columns: phone (formatted), `createdAt` (newest first from service), optional IP. Empty: «Ще немає заявок» (UI-SPEC). No row navigation unless detail page added.

---

### `src/app/(admin)/admin/nalashtuvannia/page.tsx` (route, CRUD read)

**Analog:** `src/app/(admin)/admin/kategorii/page.tsx`

```7:33:src/app/(admin)/admin/kategorii/page.tsx
export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Категорії</h1>
        <Button render={<Link href="/admin/kategorii/novyi" />}>
          <Plus className="size-4" aria-hidden />
          Додати категорію
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Немає категорій</p>
      ) : (
        <AdminCategoriesTable
```

Page loads settings + recent callbacks via service; renders `StoreSettingsForm` + `CallbackRequestsTable`.

---

### `src/components/admin/admin-nav-items.ts` (config)

**Analog:** self

```9:15:src/components/admin/admin-nav-items.ts
export const adminNavItems = [
  { href: "/admin", label: "Панель", icon: LayoutDashboard },
  { href: "/admin/kategorii", label: "Категорії", icon: FolderTree },
  { href: "/admin/tovary", label: "Товари", icon: Package },
  { href: "/admin/zamovlennia", label: "Замовлення", icon: ShoppingBag },
  { href: "/admin/chaty", label: "Чати", icon: MessageSquare },
] as const;
```

Add `{ href: "/admin/nalashtuvannia", label: "Налаштування", icon: Settings }` (import `Settings` from `lucide-react`).

---

### `src/app/(storefront)/page.tsx` (route, CRUD read)

**Analog:** self JsonLd block

```14:32:src/app/(storefront)/page.tsx
export default function HomePage() {
  const store = getStoreNap();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: store.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Львів",
            addressCountry: "UA",
            streetAddress: store.address,
          },
          areaServed: { "@type": "City", name: "Львів" },
          ...(store.phone ? { telephone: store.phone } : {}),
        }}
      />
```

Change to `export default async function HomePage()` and `const store = await getStoreNap();`.

---

### `prisma/seed.ts` (config, batch)

**Analog:** `seedCategories()` upsert loop (lines 20-28)

```20:28:prisma/seed.ts
async function seedCategories() {
  for (const { name, sortOrder } of categories) {
    const slug = slugify(name, { lower: true, strict: true, locale: "uk" });
    await prisma.category.upsert({
      where: { slug },
      create: { name, slug, sortOrder },
      update: { name, sortOrder },
    });
  }
}
```

Seed default Lviv contacts **only if tables empty**; optional read from `STORE_PHONE` / `STORE_ADDRESS` env for seed values only (not runtime display).

---

### Test files

| Test file | Analog | Key pattern |
|-----------|--------|-------------|
| `phone.test.ts` | `order.test.ts` lines 16-37 | Copy phone accept/reject cases |
| `callback.test.ts` | `category.test.ts` | `safeParse` success/failure |
| `callback-request.service.test.ts` | `chat.service.test.ts` lines 108-133 | Mock `prisma.callbackRequest.count`, assert throw at limit |
| `store-settings.service.test.ts` | `catalog.service.test.ts` | Mock prisma `findMany`, assert empty DTO omits blocks |
| `store-mobile-nav.test.tsx` | `admin-categories-table.test.tsx` | `/** @vitest-environment jsdom */`, `render`, `screen.getByText` |
| `callback-request-form.test.tsx` | `product-edit-delete-button.test.tsx` | Mock action + `vi.mock("sonner")`, assert `toast.success` / `setError` |

**Component test harness** (lines 1-18):

```1:18:src/components/admin/product-edit-delete-button.test.tsx
/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProductEditDeleteButton } from "./product-edit-delete-button";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/server/actions/admin/product.actions", () => ({
  deleteProductFromListAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
```

**Rate limit service test** (lines 108-118):

```108:118:src/server/services/chat.service.test.ts
  it("rejects when rate limit exceeded at 20 messages in window", async () => {
    vi.mocked(prisma.message.count).mockResolvedValueOnce(20);

    await expect(
      sendMessage({
        senderId: "buyer-1",
        senderRole: "BUYER",
        userId: "buyer-1",
        body: "ще одне",
      }),
    ).rejects.toMatchObject({ code: CHAT_RATE_LIMIT });
```

---

## Shared Patterns

### Authentication (admin only)

**Source:** `src/server/actions/admin/category.actions.ts`  
**Apply to:** `store-settings.actions.ts`

```typescript
await requireAdmin();
```

Guest callback action: **no** `requireAdmin()` / `requireBuyer()` (D-10).

### Server Actions file header

**Source:** `src/server/actions/order.actions.ts` line 1

```1:1:src/server/actions/order.actions.ts
"use server";
```

### Revalidation after mutations

**Source:** `src/server/actions/order.actions.ts` lines 37-39

```37:39:src/server/actions/order.actions.ts
      revalidatePath("/koszyk");
      revalidatePath("/kabinet");
      revalidatePath("/", "layout");
```

**Apply to:** Admin store settings saves and any action affecting footer contacts.

### Toast (storefront)

**Source:** `src/app/(storefront)/layout.tsx` lines 31-32

```31:32:src/app/(storefront)/layout.tsx
      <StoreFooter />
      <Toaster richColors position="top-center" closeButton />
```

Success-only for callback (D-12, D-13).

### Ukrainian UI copy

**Source:** `26-UI-SPEC.md` Copywriting Contract — locked strings for form, toast, errors.

### shadcn components

**Source:** `26-UI-SPEC.md` Component Inventory — `Button`, `Input`, `Label`, `Badge`, `Separator`, `Sheet` from `@/components/ui/*`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/phone/format-ua.ts` | utility | transform | No phone display/tel helpers in repo; implement from RESEARCH sketch |

---

## Metadata

**Analog search scope:** `prisma/`, `src/server/`, `src/components/layout/`, `src/components/admin/`, `src/components/checkout/`, `src/components/catalog/`, `src/app/(admin)/admin/`, `src/app/(storefront)/`  
**Files scanned:** ~35  
**Pattern extraction date:** 2026-05-19

---

## PATTERN MAPPING COMPLETE

**Phase:** 26 - Footer & mobile contact  
**Files classified:** 24  
**Analogs found:** 22 / 24

### Coverage
- Files with exact analog: 18
- Files with role-match analog: 4
- Files with no analog: 1 (`format-ua.ts`)

### Key Patterns Identified
- **FOOT-04:** Badge layout from `catalog-filters.tsx`; data pipeline already in `store-header.tsx` — UI-only in drawer.
- **FOOT-02/03:** One `CallbackRequestForm` — checkout phone field + product-form inline errors + sonner success only; server action like guest `order.actions.ts`.
- **Rate limit:** Prisma `count` in time window from `chat.service.ts` (not in-memory).
- **FOOT-01:** Async `StoreFooter` + `store-settings.service` list pattern from `admin-catalog.service.ts`; admin CRUD from `category.actions.ts` / `category-form.tsx`.
- **Phone validation:** Extract `uaPhoneSchema` to `phone.ts`; tests mirror `order.test.ts`.

### File Created
`.planning/phases/26-footer-mobile-contact/26-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
