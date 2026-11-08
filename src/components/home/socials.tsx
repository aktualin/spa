import { ArrowRight, Instagram } from "@/components/icons";
import { site as staticSite } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { getInstagramPosts } from "@/lib/content/homepage";
import { getSiteSettings } from "@/lib/content/site";

const galleryImages = [
  "/img/kama/01-incense.jpg",
  "/img/kama/02-bottle-shadows.jpg",
  "/img/kama/03-oil-bowl.jpg",
  "/img/kama/04-turmeric-scrub.jpg",
  "/img/kama/05-foot-bath.jpg",
  "/img/kama/06-bride.jpg",
  "/img/kama/07-flower-bowl.jpg",
  "/img/kama/08-water-drop.jpg",
  "/img/kama/09-leaf-drop.jpg",
  "/img/kama/corporate/02-massage.jpg",
  "/img/kama/corporate/05-lounge.jpg",
  "/img/kama/corporate/12-guest-lounge.jpg",
];

export async function SocialsSection() {
  // URL & username Instagram dari Kontak & Umum; kosong → tautan bawaan.
  const [settings, posts] = await Promise.all([getSiteSettings(), getInstagramPosts()]);
  const site = { instagram: settings.instagramUrl || staticSite.instagram };
  // Tabel kosong → grid foto bawaan; ada foto admin → pakai foto itu
  // (markup sel sama; alt dari admin, tautan postingan atau profil).
  const cells = posts
    ? posts.map((post, i) => ({
        key: post.key,
        src: post.imageUrl,
        alt: post.imageAlt,
        href: post.href ?? site.instagram,
        label: `Instagram post ${i + 1}`,
      }))
    : galleryImages.map((src, i) => ({
        key: src,
        src,
        alt: "",
        href: site.instagram,
        label: `Instagram post ${i + 1}`,
      }));
  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        {/* Section header */}
        <div className="flex flex-col items-start gap-4 border-b border-cocoa/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <a
              href={site.instagram}
              className="text-body text-cocoa/70 transition-colors hover:text-cocoa"
            >
              @{settings.instagramUsername}
            </a>
            <a
              href="https://www.instagram.com/explore/search/keyword/?q=%23kamaspa"
              className="font-display text-title-sm"
            >
              #kamaspa
            </a>
          </div>

          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Follow Us
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Gallery grid */}
        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
          {cells.map((cell) => (
            <li key={cell.key} className="group relative aspect-square overflow-hidden bg-cream">
              <a
                href={cell.href}
                target="_blank"
                rel="noreferrer"
                aria-label={cell.label}
                className="absolute inset-0 z-10"
              />
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
      </div>
    </Reveal>
  );
}
