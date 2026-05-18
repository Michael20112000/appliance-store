export function isProductPurchasable(
  status: string,
  quantity: number,
): boolean {
  return status === "AVAILABLE" && quantity >= 1;
}
