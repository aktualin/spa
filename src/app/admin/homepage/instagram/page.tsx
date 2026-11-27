import { requireRole } from "@/lib/auth";
import { INSTAGRAM_LIMITS } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  listInstagramPosts,
  moveInstagramPostAction,
  toggleInstagramPostAction,
} from "../../actions/homepage-content";
import { ContentList } from "../_components/content-list";

export const instant = false;

/** `https://www.instagram.com/p/Cxxxx/` → `p/Cxxxx` untuk judul baris. */
function shortLabel(postUrl: string) {
  return postUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
}

export default async function AdminHomepageInstagramPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);
  const [posts, params] = await Promise.all([listInstagramPosts(), searchParams]);

  return (
    <ContentList
      title="Instagram Feed"
      subtitle="Posts embedded in the homepage Instagram section. Just paste the post link — no photos are uploaded. The order in this list matches the order on the homepage."
      basePath="/admin/homepage/instagram"
      addLabel="Add post"
      addDisabledNote={
        posts.length >= INSTAGRAM_LIMITS.max
          ? `Max ${INSTAGRAM_LIMITS.max} posts.`
          : null
      }
      rows={posts.map((p) => ({
        id: p.id,
        title: shortLabel(p.postUrl),
        meta: "Instagram embed",
        isPublished: p.isPublished,
      }))}
      saved={params.saved}
      deleted={params.deleted}
      deletedLabel="Post deleted."
      emptyNote={
        <p>
          No posts yet. Add Instagram post links (photo, reel, or IGTV) to
          show their embeds on the homepage.
        </p>
      }
      noLiveNote="No posts are published, so the Instagram feed is empty (the title and Follow button still appear). Publish at least one post, or turn off the Socials section on the Homepage Sections page."
      footnote={`Max ${INSTAGRAM_LIMITS.max} posts. Each post is embedded directly from Instagram, so posts deleted or made private by their owner also disappear from the feed.`}
      toggleAction={toggleInstagramPostAction}
      moveAction={moveInstagramPostAction}
    />
  );
}
