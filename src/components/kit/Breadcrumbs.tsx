import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last crumb, which is the current page. */
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Accessible name for the nav landmark. */
  label?: string;
  className?: string;
}

/**
 * Trail of ancestor pages. The last crumb is plain text carrying
 * `aria-current="page"`, never a link to where you already are.
 */
export function Breadcrumbs({ items, label = 'Breadcrumb', className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <FaChevronRight aria-hidden="true" className="h-2.5 w-2.5 shrink-0 text-slate-400" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-1.5 rounded px-1 text-slate-600',
                    'hover:text-[color:var(--brand-navy)] hover:underline',
                  )}
                >
                  {item.icon && (
                    <span aria-hidden="true" className="shrink-0">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="inline-flex min-h-11 items-center gap-1.5 px-1 font-semibold text-[color:var(--brand-navy)]"
                >
                  {item.icon && (
                    <span aria-hidden="true" className="shrink-0">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
