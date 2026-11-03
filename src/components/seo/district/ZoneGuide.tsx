import { Badge, Card } from "@/components/kit";
import { ZONE_LABELS, type DeliveryZone } from "@/lib/seo/districts";
import { ZONE_ORDER, ZONE_PLANNING, ZONE_SUMMARY, ZONE_TONE } from "./copy";

/**
 * The four delivery zones, explained once.
 *
 * The zone is the single most useful thing a sender can know about a
 * destination, and it is the reason two districts the same distance apart on
 * a map take very different numbers of days.
 */
export function ZoneGuide({ highlight }: { highlight?: DeliveryZone }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ZONE_ORDER.map((zone) => {
        const isCurrent = highlight === zone;
        return (
          <Card
            as="article"
            padding="sm"
            key={zone}
            className={isCurrent ? "border-[color:var(--brand-teal)] ring-1 ring-[color:var(--brand-teal)]" : undefined}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={ZONE_TONE[zone]} variant="soft">
                {ZONE_LABELS[zone].label}
              </Badge>
              {isCurrent && (
                <span className="text-xs font-semibold text-[color:var(--brand-teal)]">
                  This district
                </span>
              )}
            </div>
            <p className="mt-3 text-sm font-semibold text-[color:var(--brand-navy)]">
              {ZONE_LABELS[zone].eta}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{ZONE_SUMMARY[zone]}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{ZONE_PLANNING[zone]}</p>
          </Card>
        );
      })}
    </div>
  );
}

export default ZoneGuide;
