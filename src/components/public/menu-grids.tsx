/**
 * Grid treatment & package untuk halaman lama /menu.
 *
 * Markup-nya sama persis dengan sebelumnya supaya tampilan /menu tidak
 * berubah; hanya sumber datanya yang bisa diambil dari DB.
 */
import Link from "next/link";

import { Check } from "@/components/icons";
import type { Package as StaticPackage, Treatment as StaticTreatment } from "@/data/content";

const categoryLabels: Record<string, string> = {
  Massage: "Massage",
  Body: "Body",
  Face: "Facials",
  "Head & Scalp": "Head & Scalp",
  Bath: "Bath",
};

export function MassageGrid({ items }: { items: StaticTreatment[] }) {
  return (
    <div className="w-layout-grid whats-new_list">
      {items.map((t) => (
        <Link key={t.slug} href={`/menu/${t.slug}`} className="treatment-card w-dyn-item">
          <div className="treatment-card_image image-container">
            <img src={t.image} alt={t.name} loading="lazy" className="image-cover" />
          </div>
          <div className="treatment-card_body">
            <div className="eyebrow-s text-style-allcaps">{categoryLabels[t.category]}</div>
            <h3 className="header-s">{t.name}</h3>
            <div className="body-m text-color-gray">{t.tagline}</div>
            <div className="treatment-card_price-row">
              <span className="caption-s text-color-gray">{t.prices[0].duration}</span>
              <span className="price-row_value">{t.prices[0].price}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function PackagesGrid({ items }: { items: StaticPackage[] }) {
  return (
    <div className="w-layout-grid whats-new_list">
      {items.map((p) => (
        <Link key={p.slug} href={`/menu/${p.slug}`} className="package-card w-dyn-item">
          <div className="package-card_image image-container">
            <img src={p.image} alt={p.name} loading="lazy" className="image-cover" />
          </div>
          <div className="package-card_body">
            <div className="eyebrow-s text-style-allcaps">{p.subtitle}</div>
            <h3 className="header-s">{p.name}</h3>
            <div className="body-m text-color-gray">{p.description}</div>
            <div className="package-includes">
              {p.includes.map((inc) => (
                <span key={inc.label} className="package-includes_item">
                  <Check />
                  {inc.label} {inc.minutes}
                </span>
              ))}
            </div>
            <div className="spacer-small" />
            <div className="treatment-card_price-row">
              <span className="caption-s text-color-gray">{p.duration}</span>
              <span className="price-row_value">{p.price}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
