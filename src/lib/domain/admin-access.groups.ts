/** Pengelompokan modul untuk sidebar — lihat `admin-access.ts`. */

export type AccessGroup = {
  id: string;
  label: string;
};

export type GroupedModules<M> = AccessGroup & { modules: M[] };

/**
 * Mengelompokkan modul untuk sidebar mengikuti urutan `groups`. Kelompok yang
 * tidak punya modul (karena role-nya tidak berhak) dibuang. Modul dengan
 * `group` di luar daftar tidak pernah hilang: ia ditaruh di kelompok tambahan
 * di akhir, supaya modul baru yang lupa dikelompokkan tetap bisa dibuka.
 */
export function groupModules<M extends { group: string }>(
  modules: readonly M[],
  groups: readonly AccessGroup[],
): GroupedModules<M>[] {
  const known = new Map(groups.map((g) => [g.id, g.label]));
  const buckets = new Map<string, M[]>();
  for (const m of modules) {
    const bucket = buckets.get(m.group);
    if (bucket) bucket.push(m);
    else buckets.set(m.group, [m]);
  }

  const result: GroupedModules<M>[] = [];
  for (const group of groups) {
    const bucketModules = buckets.get(group.id);
    if (bucketModules?.length) result.push({ ...group, modules: bucketModules });
  }
  for (const [id, bucketModules] of buckets) {
    if (known.has(id)) continue;
    result.push({ id, label: id, modules: bucketModules });
  }
  return result;
}