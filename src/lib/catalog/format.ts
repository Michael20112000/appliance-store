import type { ProductCondition } from "@/generated/prisma/client";

const conditionLabels: Record<ProductCondition, string> = {
  LIKE_NEW: "Як нова",
  GOOD: "Добрий стан",
  FAIR: "Задовільний",
};

export function formatPriceKopiyky(kopiyky: number): string {
  const uah = Math.round(kopiyky / 100);
  return `${uah.toLocaleString("uk-UA")} ₴`;
}

export function conditionLabelUa(condition: ProductCondition): string {
  return conditionLabels[condition];
}

export function pluralResultsUa(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} товари`;
  }
  return `${count} товарів`;
}
