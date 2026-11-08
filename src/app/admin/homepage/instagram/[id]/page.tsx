import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getInstagramPost } from "../../../actions/homepage-content";
import { InstagramForm, type InstagramFormData } from "../../_components/content-forms";

export const instant = false;

export default async function HomepageInstagramEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);
  const { id } = await params;

  let data: InstagramFormData;
  if (id === "new") {
    data = { id: null, imageUrl: "", imageAlt: "", href: "", isPublished: true };
  } else {
    const post = await getInstagramPost(id);
    if (!post) notFound();
    data = {
      id: post.id,
      imageUrl: post.imageUrl,
      imageAlt: post.imageAlt ?? "",
      href: post.href ?? "",
      isPublished: post.isPublished,
    };
  }
  return <InstagramForm post={data} />;
}
