export type InstagramEmbedItem = {
  key: string;
  /** URL iframe embed resmi Instagram (`…/p/{code}/embed`). */
  embedUrl: string;
  /** Judul/aria iframe; placeholder {n} sudah diisi pemanggil. */
  label: string;
};

/**
 * Grid embed postingan Instagram (section Socials): tiap postingan dirender
 * sebagai iframe embed resmi Instagram, dimuat lazy. Tinggi tetap supaya grid
 * rapi; konten yang lebih panjang dapat digulir di dalam iframe.
 */
export function InstagramEmbeds({ items }: { items: InstagramEmbedItem[] }) {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.key} className="min-w-0">
          <iframe
            src={item.embedUrl}
            title={item.label}
            loading="lazy"
            className="h-[600px] w-full rounded-md border border-cocoa/10 bg-white"
          />
        </li>
      ))}
    </ul>
  );
}
