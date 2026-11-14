/** Koordinat peta cabang — lihat `branch.ts`. */

export type MapPoint = { latitude: number; longitude: number };

/**
 * Titik tengah peta: rata-rata koordinat cabang yang punya koordinat.
 * Mengembalikan `null` bila belum ada satu pun — peta lalu tidak dirender,
 * daripada memakai koordinat hardcode.
 */
export function branchesCenter(
  branches: readonly { latitude: number | null; longitude: number | null }[],
): MapPoint | null {
  const points = branches.flatMap((b) =>
    b.latitude !== null && b.longitude !== null
      ? [{ latitude: b.latitude, longitude: b.longitude }]
      : [],
  );
  if (points.length === 0) return null;
  const sum = points.reduce(
    (acc, p) => ({ latitude: acc.latitude + p.latitude, longitude: acc.longitude + p.longitude }),
    { latitude: 0, longitude: 0 },
  );
  return {
    latitude: sum.latitude / points.length,
    longitude: sum.longitude / points.length,
  };
}