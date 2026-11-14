import { ArrowRight } from "@/components/icons";

/** Baris atas teaser: username, hashtag, dan tautan follow Instagram. */
export function GalleryTeaserHeader({
  instagramUrl,
  instagramUsername,
  hashtag,
  hashtagHref,
  followLabel,
}: {
  instagramUrl: string | null;
  instagramUsername: string;
  hashtag: string;
  hashtagHref: string;
  followLabel: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 border-b border-cocoa/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        {instagramUrl && instagramUsername ? (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body text-cocoa/70 transition-colors hover:text-cocoa"
          >
            @{instagramUsername}
          </a>
        ) : null}
        {hashtag && hashtagHref ? (
          <a
            href={hashtagHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-title-sm"
          >
            {hashtag}
          </a>
        ) : null}
      </div>

      {instagramUrl && followLabel ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          {followLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  );
}