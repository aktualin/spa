import Link from "next/link";

import { OptionPriceRow, PackagePriceRow } from "./price-forms";
import type { PriceData } from "./prices-data";

/** Harga per kategori treatment/add-on beserta opsi durasinya. */
export function CategoryPrices({ categories }: { categories: PriceData["categories"] }) {
  return (
    <>
      {categories.map((category) => (
        <section key={category.id}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {category.name}
            {category.kind === "ADDON" ? " (add-on)" : ""}
          </h2>

          {category.treatments.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">
              Belum ada treatment di kategori ini.
            </p>
          ) : (
            <div className="mt-2 space-y-4">
              {category.treatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="rounded-lg border border-neutral-200 bg-white p-4"
                >
                  <Link
                    href={`/admin/treatments/${treatment.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {treatment.name}
                  </Link>

                  {treatment.options.length === 0 ? (
                    <p className="mt-2 text-sm text-neutral-500">
                      Belum ada opsi durasi/harga.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {treatment.options.map((option) => (
                        <OptionPriceRow
                          key={option.id}
                          optionId={option.id}
                          label={option.label}
                          durationMin={String(option.durationMin)}
                          priceIdr={String(option.priceIdr)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}

/** Harga package. */
export function PackagePrices({ packages }: { packages: PriceData["packages"] }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Package
      </h2>

      {packages.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">Belum ada package.</p>
      ) : (
        <div className="mt-2 space-y-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-lg border border-neutral-200 bg-white p-3"
            >
              <PackagePriceRow
                packageId={pkg.id}
                name={pkg.name}
                durationMin={pkg.durationMin ? String(pkg.durationMin) : ""}
                priceIdr={String(pkg.priceIdr)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}