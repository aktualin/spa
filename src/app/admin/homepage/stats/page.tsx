import { requireRole } from "@/lib/auth";
import { STAT_LIMITS } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  importDefaultStatsAction,
  listHomepageStats,
  moveHomepageStatAction,
  toggleHomepageStatAction,
} from "../../actions/homepage-content";
import { ContentList } from "../_components/content-list";

export const instant = false;

export default async function AdminHomepageStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);
  const [stats, params] = await Promise.all([listHomepageStats(), searchParams]);

  return (
    <ContentList
      title="Brand Intro Stats"
      subtitle="The “KAMA at a glance” number boxes in the Brand Intro section. The order in this list matches the order on the homepage."
      basePath="/admin/homepage/stats"
      addLabel="Add stat"
      addDisabledNote={
        stats.length >= STAT_LIMITS.max ? `Max ${STAT_LIMITS.max} stats.` : null
      }
      rows={stats.map((s) => ({
        id: s.id,
        title: `${s.value} — ${s.label}`,
        meta: "Brand Intro",
        isPublished: s.isPublished,
      }))}
      saved={params.saved}
      deleted={params.deleted}
      deletedLabel="Stat deleted."
      emptyNote={
        <>
          <p>
            No stats yet. Currently Brand Intro shows the site’s 3 default stats.
            As soon as the first stat is saved, the default stats are{" "}
            <strong>replaced entirely</strong> by this list.
          </p>
          <p>To keep the appearance unchanged, copy the default stats first, then edit them as needed.</p>
        </>
      }
      importLabel="Copy default stats"
      importAction={importDefaultStatsAction}
      noLiveNote="No stats are published, so the number boxes in Brand Intro are empty. Publish at least one stat."
      footnote="The layout uses 3 columns, so multiples of 3 look tidiest. The entire Brand Intro section can be hidden from the Homepage Sections page."
      toggleAction={toggleHomepageStatAction}
      moveAction={moveHomepageStatAction}
    />
  );
}
