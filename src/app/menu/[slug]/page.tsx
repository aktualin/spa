import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Check } from "@/components/icons";
import { packages, priceDisclaimer, treatments } from "@/data/content";
import { getMenuEntry } from "@/lib/content/catalog";

// Daftar statis hanya untuk prerender saat build (Next mensyaratkan minimal
// satu slug); isi halaman selalu dibaca dari database lewat getMenuEntry.
export function generateStaticParams() {
  return [...treatments, ...packages].map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getMenuEntry(slug);

  if (!entry) {
    return { title: "Treatment Not Found" };
  }

  return {
    title: entry.name,
    description:
      entry.kind === "package"
        ? `${entry.subtitle}. ${entry.description}`
        : [entry.tagline, entry.description].filter(Boolean).join(". "),
  };
}

export default function TreatmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /* The params are runtime data: reading them must happen inside a
     Suspense boundary, otherwise Next.js complains about "URL data during
     prerendering". Every slug of `generateStaticParams` is prerendered, so
     the fallback is only a safety net. */
  return (
    <>
      <Navigation />
      <Suspense fallback={<TreatmentFallback />}>
        <TreatmentContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function TreatmentFallback() {
  return (
    <main className="main-wrapper">
      <section className="page-hero">
        <div className="padding-global">
          <div className="container-large">
            <div className="eyebrow-s text-style-allcaps">KAMA Spa</div>
            <h1 className="header-xxl">Memuat treatment…</h1>
          </div>
        </div>
      </section>
    </main>
  );
}

async function TreatmentContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getMenuEntry(slug);

  if (!entry) {
    notFound();
  }

  return (
    <main className="main-wrapper">
        <section className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="layout-row gap-large">
                <div className="sizing-grow">
                  <div className="eyebrow-s text-style-allcaps">
                    {entry.kind === "package" ? "All Day Spa" : entry.category}
                  </div>
                  <h1 className="header-xxl">{entry.name}</h1>
                  <div className="body-m text-color-gray">
                    {entry.kind === "package" ? entry.subtitle : entry.tagline}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="layout-row gap-xlarge">
                <div className="sizing-grow">
                  <div className="page-hero_image image-container">
                    <img
                      src={entry.image}
                      alt={entry.name}
                      className="image-cover"
                      loading="eager"
                    />
                  </div>

                  <div className="spacer-large" />

                  <p className="body-l">{entry.description}</p>

                  {entry.kind === "package" ? (
                    <>
                      <div className="spacer-large" />
                      <div className="text-rich-text header-l w-richtext">
                        <p>
                          <em>“{entry.quote}”</em>
                        </p>
                      </div>
                    </>
                  ) : entry.note ? (
                    <>
                      <div className="spacer-small" />
                      <div className="eyebrow-s text-style-allcaps">{entry.note}</div>
                    </>
                  ) : null}
                </div>

                <div className="sizing-grow">
                  <div className="package-card">
                    <div className="package-card_body">
                      <div className="eyebrow-s text-style-allcaps">Pricing</div>

                      {entry.kind === "package" ? (
                        <>
                          <div className="price-row">
                            <span className="price-row_duration">{entry.duration}</span>
                            <span className="price-row_value">{entry.price}</span>
                          </div>
                          <div className="spacer-small" />
                          <div className="eyebrow-s text-style-allcaps">Include</div>
                          <div className="package-includes">
                            {entry.includes.map((inc) => (
                              <span key={inc.label} className="package-includes_item">
                                <Check />
                                {inc.label} {inc.minutes}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        entry.prices.map((p) => (
                          <div key={p.duration} className="price-row">
                            <span className="price-row_duration">{p.duration}</span>
                            <span className="price-row_value">{p.price}</span>
                          </div>
                        ))
                      )}

                      <div className="spacer-small" />
                      <div className="eyebrow-s text-color-gray">{priceDisclaimer}</div>

                      <div className="spacer-medium" />
                      <Link href="/contact" className="button width-fill w-inline-block">
                        <div>Book This Treatment</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}
