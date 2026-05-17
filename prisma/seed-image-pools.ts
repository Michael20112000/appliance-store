/** Pexels photo IDs (free license) — appliance-themed pools per category. */
export const CATEGORY_PEXELS_POOL: Record<string, readonly number[]> = {
  "pralni-mashyny": [
    5591663, 10566958, 3760069, 3760068, 3760067, 4433766, 4433765, 4433764, 5709660, 5709661, 5709662, 5709663,
    5709664, 6480709,
  ],
  kholodylnyky: [
    4933252, 6476587, 6476590, 6476593, 6476594, 6476595, 6476596, 6476598, 6476599, 6476600, 6476601,
    6476602, 6527057, 6980571,
  ],
  "morozylni-kamery": [
    6373834, 4933252, 6476587, 6476590, 6476593, 6476594, 6476595, 6476596, 6476598, 6476599, 6476600,
    6476601, 6476602, 6527057,
  ],
  televizory: [
    1571460, 1571453, 2724749, 1092679, 1092685, 1092687, 1092688, 1092689, 1092690, 1092691, 1092692,
    1092693, 1092694, 1092696,
  ],
  plyty: [5824916, 5824918, 5824921, 4042802, 373564, 4391470, 1813270, 6527057, 6980571, 5824916],
  "dukhovi-shafy": [
    4042806, 4391470, 1813270, 373564, 4042802, 5824916, 5824918, 5824921, 6527057, 6980571, 4042806,
    4391470, 1813270,
  ],
  "varylni-poverkhni": [
    6980571, 6527057, 5824916, 5824918, 5824921, 4042802, 373564, 4391470, 1813270, 6980571, 6527057,
  ],
  "susharky-dlya-odyahu": [
    10565602, 10566958, 5709665, 5709666, 5709668, 5709669, 5709670, 6480710, 6480712, 6480714, 6480715, 6480716,
    6480720, 6480721,
  ],
  telephony: [
    607812, 607813, 799761, 799775, 788946, 4041392, 1092644, 1092645, 421890, 421891, 421892, 421896,
    421900, 421901,
  ],
};

const FALLBACK_POOL: readonly number[] = [6527057, 6980571, 4933252, 5591663];

export function pexelsImageUrl(photoId: number): string {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&fit=crop`;
}

export function resolvePexelsPhotoId(categorySlug: string, indexInCategory: number): number {
  const pool = CATEGORY_PEXELS_POOL[categorySlug] ?? FALLBACK_POOL;
  return pool[indexInCategory % pool.length]!;
}

export function seedImagePublicId(categorySlug: string, poolIndex: number): string {
  return `appliance-store/seed/${categorySlug}/${poolIndex}`;
}
