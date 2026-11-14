import type { Branch } from "@/lib/content/branches";
import type { NewsletterCopy } from "@/lib/domain/forms";
import { NewsletterForm } from "./forms/newsletter-form";

/**
 * Newsletter — form sungguhan ke /api/newsletter; judul & deskripsi
 * dari CB grup "forms". Latar terang agar field & tombol legacy
 * (.form_input, .button.is-tertiary) tetap terbaca.
 */
export function FooterNewsletter({
  newsletter,
  branches,
}: {
  newsletter: NewsletterCopy;
  branches: Branch[];
}) {
  if (!newsletter.title && !newsletter.description) return null;

  return (
    <section className="bg-cream">
      <div className="container-kama">
        <div className="newsletter_component flex-col gap-6 border-b-0 py-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="newsletter-text_wrapp max-w-[34rem] p-0">
            {newsletter.title ? (
              <h2 className="font-display text-title md:text-[1.75rem] md:leading-[1.2]">
                {newsletter.title}
              </h2>
            ) : null}
            {newsletter.description ? (
              <p className="text-body text-cocoa/70">{newsletter.description}</p>
            ) : null}
          </div>
          <div className="w-full md:max-w-md">
            <NewsletterForm branches={branches} copy={newsletter} />
          </div>
        </div>
      </div>
    </section>
  );
}