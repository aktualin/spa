import { MOBILE_MEDIA_QUERY } from "@/lib/domain/homepage-banner";
import type { HeroSlideView } from "@/lib/domain/hero-slide";

function videoType(url: string): string {
  return /\.webm(?:[?#]|$)/i.test(url) ? "video/webm" : "video/mp4";
}

/**
 * Media satu slide hero: video (muted, loop, dengan poster) atau `<picture>`
 * dengan sumber mobile bila tersedia. Slide pertama eager/high priority.
 */
export function HeroSlideMedia({
  slide,
  index,
  active,
  videoRef,
}: {
  slide: HeroSlideView;
  index: number;
  active: boolean;
  videoRef: (node: HTMLVideoElement | null) => void;
}) {
  return (
    <div
      data-hero-slide={index}
      data-active={active ? "true" : "false"}
      className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={active ? undefined : true}
    >
      {slide.mediaType === "VIDEO" && slide.videoUrl ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload={index === 0 ? "metadata" : "none"}
          poster={slide.imageUrl}
          tabIndex={-1}
          aria-label={slide.imageAlt || undefined}
          disablePictureInPicture
        >
          <source src={slide.videoUrl} type={videoType(slide.videoUrl)} />
        </video>
      ) : (
        <picture>
          {slide.mobileImageUrl ? (
            <source media={MOBILE_MEDIA_QUERY} srcSet={slide.mobileImageUrl} />
          ) : null}
          <img
            src={slide.imageUrl}
            alt={slide.imageAlt}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            className="h-full w-full object-cover"
          />
        </picture>
      )}
    </div>
  );
}