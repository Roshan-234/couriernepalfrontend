import Link from 'next/link';
import { FaArrowDown, FaArrowRight, FaArrowUp } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface StatCardTrend {
  direction: TrendDirection;
  /** Short change text, e.g. "+12%". */
  value: string;
  /** What the change is measured against, e.g. "vs last week". */
  label?: string;
  /** Set when a rise is bad news, e.g. failed deliveries. */
  invertColour?: boolean;
}

export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  label: string;
  value: React.ReactNode;
  /** Supporting line under the value. */
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: StatCardTrend;
  loading?: boolean;
  /** Turns the whole tile into a link to the detail view. */
  href?: string;
}

const TREND_ICONS: Record<TrendDirection, typeof FaArrowUp> = {
  up: FaArrowUp,
  down: FaArrowDown,
  flat: FaArrowRight,
};

function trendClasses(trend: StatCardTrend): string {
  if (trend.direction === 'flat') return 'text-slate-600';
  const good = trend.invertColour ? trend.direction === 'down' : trend.direction === 'up';
  return good ? 'text-green-700' : 'text-red-700';
}

/**
 * Single headline number for a dashboard. The trend arrow is paired with its
 * own text, so the direction never depends on colour alone.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  loading = false,
  href,
  className,
  ...rest
}: StatCardProps) {
  const TrendIcon = trend ? TREND_ICONS[trend.direction] : null;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow text-slate-600">{label}</p>
        {icon && (
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700"
          >
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton height="2rem" width="60%" className="mt-3" />
      ) : (
        <p className="mt-2 text-3xl font-bold tabular-nums text-[color:var(--brand-navy)]">
          {value}
        </p>
      )}

      {(hint || trend) && !loading && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {trend && TrendIcon && (
            <span className={cn('inline-flex items-center gap-1 font-semibold', trendClasses(trend))}>
              <TrendIcon aria-hidden="true" className="h-3 w-3" />
              {trend.value}
              {trend.label && <span className="font-normal text-slate-600">{trend.label}</span>}
            </span>
          )}
          {hint && <span className="text-slate-600">{hint}</span>}
        </div>
      )}
    </>
  );

  const surface = cn(
    'panel block p-5!',
    href && 'transition-shadow hover:shadow-md',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={surface}>
        {body}
      </Link>
    );
  }

  return (
    <div className={surface} {...rest}>
      {body}
    </div>
  );
}

export default StatCard;
