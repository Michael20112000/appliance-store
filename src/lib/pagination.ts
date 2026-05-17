export function computeTotalPages(total: number, pageSize: number): number {
  if (total === 0) return 1;
  return Math.ceil(total / pageSize);
}

export function getPageNumbers(
  current: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];
  for (let index = 0; index < sorted.length; index++) {
    const page = sorted[index];
    const previous = sorted[index - 1];
    if (index > 0 && page - previous > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }
  return result;
}

export const ADMIN_PAGE_SIZES = [10, 20, 50] as const;

export type AdminPageSize = (typeof ADMIN_PAGE_SIZES)[number];
