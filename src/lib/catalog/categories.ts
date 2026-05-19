/** Categories that have at least one available product (storefront nav / filters). */
export function categoriesWithAvailableProducts<
  T extends { productCount: number },
>(categories: T[]): T[] {
  return categories.filter((category) => category.productCount > 0);
}
