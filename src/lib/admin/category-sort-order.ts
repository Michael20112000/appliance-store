export type CategoryRankRow = { id: string; sortOrder: number };

/** Clamp to integer rank in [min, max]. */
export function clampCategoryRank(rank: number, min: number, max: number): number {
  if (!Number.isFinite(rank)) return min;
  return Math.min(max, Math.max(min, Math.round(rank)));
}

/** Assign contiguous ranks 1..n by current sortOrder (tie-break id). */
export function normalizeCategoryRanks(rows: CategoryRankRow[]): CategoryRankRow[] {
  const sorted = [...rows].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
  );
  return sorted.map((row, index) => ({ ...row, sortOrder: index + 1 }));
}

/** Move existing category to newRank (1-based) among n categories. */
export function moveCategoryToRank(
  rows: CategoryRankRow[],
  categoryId: string,
  newRank: number,
): CategoryRankRow[] {
  const normalized = normalizeCategoryRanks(rows);
  const n = normalized.length;
  if (n === 0) return normalized;

  const target = clampCategoryRank(newRank, 1, n);
  const fromIndex = normalized.findIndex((row) => row.id === categoryId);
  if (fromIndex === -1) return normalized;

  const toIndex = target - 1;
  const next = [...normalized];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((row, index) => ({ ...row, sortOrder: index + 1 }));
}

/** Insert a new category at newRank (1..n+1) before persisting the new row. */
export function insertCategoryAtRank(
  rows: CategoryRankRow[],
  newCategoryId: string,
  newRank: number,
): CategoryRankRow[] {
  const normalized = normalizeCategoryRanks(rows);
  const n = normalized.length;
  const target = clampCategoryRank(newRank, 1, n + 1);
  const next = [...normalized];
  next.splice(target - 1, 0, { id: newCategoryId, sortOrder: target });
  return next.map((row, index) => ({ ...row, sortOrder: index + 1 }));
}
