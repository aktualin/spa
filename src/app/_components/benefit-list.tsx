import { Check } from "@/components/icons";

/** Daftar benefit dengan ikon centang (corporate, membership). */
export function BenefitList({
  items,
  className = "benefit-list",
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="benefit-list_item">
          <span className="benefit-list_icon">
            <Check />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}