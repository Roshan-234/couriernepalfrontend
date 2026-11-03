import Link from "next/link";
import { Badge } from "@/components/kit";
import { ZONE_LABELS, type DistrictRecord } from "@/lib/seo/districts";
import { ZONE_TONE } from "./copy";

/**
 * A grid of real links to district pages.
 *
 * These are the edges that turn 77 landing pages into a cluster instead of 77
 * orphans, so they are plain `<Link>` elements with the district name as the
 * anchor text — nothing script-driven, nothing a crawler has to execute.
 */
export function DistrictLinks({
  districts,
  showZone = true,
}: {
  districts: DistrictRecord[];
  showZone?: boolean;
}) {
  if (districts.length === 0) return null;

  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {districts.map((district) => (
        <li key={district.slug}>
          <Link
            href={`/courier/${district.slug}`}
            className="flex h-full flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-[color:var(--brand-teal)] hover:bg-[#f2f8f9]"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[color:var(--brand-navy)]">
                {district.name}
              </span>
              <span className="block text-xs text-slate-600">
                {district.headquarters === district.name
                  ? "District headquarters"
                  : `via ${district.headquarters}`}
              </span>
            </span>
            {showZone && (
              <Badge tone={ZONE_TONE[district.zone]} variant="soft" size="sm">
                {ZONE_LABELS[district.zone].label}
              </Badge>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default DistrictLinks;
