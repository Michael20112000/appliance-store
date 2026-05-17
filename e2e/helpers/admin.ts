import { expect, type Page } from "@playwright/test";

export function adminCredentials() {
  return {
    email:
      process.env.ADMIN_EMAIL ?? "official.michael.developer@gmail.com",
    password: process.env.ADMIN_PASSWORD ?? "michael20112000",
  };
}

export async function loginAsAdmin(page: Page) {
  const { email, password } = adminCredentials();

  await page.goto("/uviity");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Увійти" }).click();
  await expect(page).toHaveURL(/\/kabinet/);
}

export function hasCloudinarySecrets(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}
