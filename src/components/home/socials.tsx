import { ArrowRight, Instagram } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { getInstagramPosts, type HomepageSection } from "@/lib/content/homepage";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { getSiteSettings } from "@/lib/content/site";

export async function SocialsSection({
  section,
  copyBlocks,
}: {
  section?: HomepageSection | null;
  copyBlocks: PageCopy;
}) {
  const [settings, posts] = await Promise.all([getSiteSettings(), getInstagramPosts()]);
  const instagramUrl = settings.instagramUrl;
  const hashtag = copy(copyBlocks, "global.instagram_hashtag");
  const hashtagHref = copy(copyBlocks, "global.instagram_hashtag_href");
  const followLabel =
    section?.ctaLabel?.trim() || copy(copyBlocks, "global.instagram_follow_label");
  const emptyText =
    copy(copyBlocks, "home.socials.empty") || copy(copyBlocks, "global.instagram_empty");
  const cells = (posts ?? []).map((post, i) => ({
    key: post.key,
    src: post.imageUrl,
    alt: post.imageAlt,
    href: post.href ?? instagramUrl,
    label: `Instagram post ${i + 1}`,
  }));

  // Tanpa URL Instagram maupun foto dari admin, bagian ini tidak punya isi.
  if (!instagramUrl && cells.length === 0) return null;

  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        {/* Section header */}
        <div className="flex flex-col items-start gap-4 border-b border-cocoa/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            {settings.instagramUsername ? (
              <a
                href={instagramUrl}
                className="text-body text-cocoa/70 transition-colors hover:text-cocoa"
              >
                @{settings.instagramUsername}
              </a>
            ) : null}
            {hashtag && hashtagHref ? (
              <a href={hashtagHref} className="font-display text-title-sm">
                {hashtag}
              </a>
            ) : null}
          </div>

          {instagramUrl && followLabel ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              {followLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        {/* Gallery grid */}
        {cells.length === 0 ? (
          emptyText ? <p className="mt-8 text-body text-cocoa/60">{emptyText}</p> : null
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
            {cells.map((cell) => (
              <li key={cell.key} className="group relative aspect-square overflow-hidden bg-cream">
                {cell.href ? (
                  <a
                    href={cell.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={cell.label}
                    className="absolute inset-0 z-10"
                  />
                ) : null}
                <img
                  src={cell.src}
                  alt={cell.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cocoa/0 opacity-0 transition-opacity duration-300 group-hover:bg-cocoa/40 group-hover:opacity-100">
                  <Instagram className="h-6 w-6 text-white" />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
}
