import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  onPageChange?: (page: number) => void;
  /** Supply to render real links instead of buttons (server-rendered lists). */
  hrefFor?: (page: number) => string;
  /** Page numbers kept either side of the current page. */
  siblingCount?: number;
  /** Total rows across all pages, for the "Showing x to y of z" summary. */
  totalItems?: number;
  pageSize?: number;
  /** Accessible name for the nav landmark. */
  label?: string;
  className?: string;
}

const ELLIPSIS = 'ellipsis';

/** Page numbers to render, with gaps collapsed into ellipses. */
function buildRange(page: number, pageCount: number, siblingCount: number): Array<number | string> {
  const total = siblingCount * 2 + 5;
  if (pageCount <= total) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const left = Math.max(page - siblingCount, 2);
  const right = Math.min(page + siblingCount, pageCount - 1);
  const items: Array<number | string> = [1];

  if (left > 2) items.push(`${ELLIPSIS}-start`);
  for (let current = left; current <= right; current += 1) items.push(current);
  if (right < pageCount - 1) items.push(`${ELLIPSIS}-end`);

  items.push(pageCount);
  return items;
}

const ITEM_BASE =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-semibold';

/**
 * Page navigation. Renders `<a>` when `hrefFor` is given and `<button>`
 * otherwise, never bare divs, and marks the current page with
 * `aria-current="page"`.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  hrefFor,
  siblingCount = 1,
  totalItems,
  pageSize,
  label = 'Pagination',
  className,
}: PaginationProps) {
  if (pageCount <= 1 && totalItems === undefined) return null;

  const items = buildRange(page, pageCount, siblingCount);
  const firstRow = pageSize ? (page - 1) * pageSize + 1 : null;
  const lastRow =
    pageSize && totalItems ? Math.min(page * pageSize, totalItems) : null;

  const renderItem = (targetPage: number, content: React.ReactNode, options: {
    ariaLabel: string;
    current?: boolean;
    disabled?: boolean;
    className?: string;
  }) => {
    const classes = cn(
      ITEM_BASE,
      options.current
        ? 'bg-[color:var(--brand-navy)] text-white'
        : 'text-slate-700 hover:bg-slate-100 hover:text-[color:var(--brand-navy)]',
      options.disabled && 'cursor-not-allowed text-slate-400 hover:bg-transparent',
      options.className,
    );

    if (options.disabled) {
      return (
        <button type="button" disabled aria-label={options.ariaLabel} className={classes}>
          {content}
        </button>
      );
    }

    if (hrefFor) {
      return (
        <Link
          href={hrefFor(targetPage)}
          aria-label={options.ariaLabel}
          aria-current={options.current ? 'page' : undefined}
          className={classes}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onPageChange?.(targetPage)}
        aria-label={options.ariaLabel}
        aria-current={options.current ? 'page' : undefined}
        className={classes}
      >
        {content}
      </button>
    );
  };

  return (
    <nav
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-between gap-3 sm:flex-row',
        className,
      )}
    >
      {totalItems !== undefined && (
        <p className="text-sm text-slate-600">
          {totalItems === 0 || firstRow === null || lastRow === null ? (
            <>{totalItems} results</>
          ) : (
            <>
              Showing <span className="font-semibold text-slate-800">{firstRow}</span> to{' '}
              <span className="font-semibold text-slate-800">{lastRow}</span> of{' '}
              <span className="font-semibold text-slate-800">{totalItems}</span>
            </>
          )}
        </p>
      )}

      {pageCount > 1 && (
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            {renderItem(page - 1, <FaChevronLeft aria-hidden="true" className="h-3 w-3" />, {
              ariaLabel: 'Go to previous page',
              disabled: page <= 1,
            })}
          </li>

          {items.map((item) =>
            typeof item === 'number' ? (
              <li key={item}>
                {renderItem(item, item, {
                  ariaLabel: `Go to page ${item}`,
                  current: item === page,
                })}
              </li>
            ) : (
              <li
                key={item}
                aria-hidden="true"
                className="inline-flex min-h-11 items-center px-1 text-slate-500"
              >
                &hellip;
              </li>
            ),
          )}

          <li>
            {renderItem(page + 1, <FaChevronRight aria-hidden="true" className="h-3 w-3" />, {
              ariaLabel: 'Go to next page',
              disabled: page >= pageCount,
            })}
          </li>
        </ul>
      )}
    </nav>
  );
}

export default Pagination;
