import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc';
export type CellAlign = 'left' | 'center' | 'right';

const ALIGN: Record<CellAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Table caption. Always provide one, or an `aria-label` on the table. */
  caption?: React.ReactNode;
  /** Keep the caption for screen readers but hide it visually. */
  captionVisible?: boolean;
  /** Wrap the table in a horizontally scrollable container. */
  scrollable?: boolean;
  containerClassName?: string;
}

/** Bare table element with a caption and an optional scroll container. */
export function Table({
  caption,
  captionVisible = true,
  scrollable = true,
  containerClassName,
  className,
  children,
  ...rest
}: TableProps) {
  const table = (
    <table className={cn('w-full border-collapse text-left text-sm', className)} {...rest}>
      {caption && (
        <caption
          className={cn(
            captionVisible ? 'px-4 py-3 text-left text-sm text-slate-600' : 'sr-only',
          )}
        >
          {caption}
        </caption>
      )}
      {children}
    </table>
  );

  if (!scrollable) return table;

  return <div className={cn('w-full overflow-x-auto', containerClassName)}>{table}</div>;
}

export interface THeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Pin the header row while the table body scrolls. */
  sticky?: boolean;
}

export function THead({ sticky = false, className, children, ...rest }: THeadProps) {
  return (
    <thead
      className={cn(
        'bg-slate-50 text-xs uppercase tracking-wide text-slate-700',
        sticky && 'sticky top-0 z-10',
        className,
      )}
      {...rest}
    >
      {children}
    </thead>
  );
}

export function TBody({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-slate-200', className)} {...rest}>
      {children}
    </tbody>
  );
}

export interface TRProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Adds the hover affordance for rows that respond to a click. */
  interactive?: boolean;
  selected?: boolean;
}

export function TR({ interactive = false, selected = false, className, children, ...rest }: TRProps) {
  return (
    <tr
      aria-selected={selected || undefined}
      className={cn(
        'align-middle',
        interactive && 'cursor-pointer hover:bg-teal-50/60',
        selected && 'bg-teal-50',
        className,
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}

export interface THProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'scope'> {
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  align?: CellAlign;
  /** Renders the header as a sort toggle and sets `aria-sort`. */
  sortable?: boolean;
  /** Current direction for this column; omit when the table is sorted elsewhere. */
  sortDirection?: SortDirection | null;
  onSort?: () => void;
  /** Hide the header text visually (icon or action columns). */
  srOnly?: boolean;
}

/** Header cell. `scope="col"` by default, with `aria-sort` when sortable. */
export function TH({
  scope = 'col',
  align = 'left',
  sortable = false,
  sortDirection = null,
  onSort,
  srOnly = false,
  className,
  children,
  ...rest
}: THProps) {
  const ariaSort = sortable
    ? sortDirection === 'asc'
      ? 'ascending'
      : sortDirection === 'desc'
        ? 'descending'
        : 'none'
    : undefined;

  const SortIcon = sortDirection === 'asc' ? FaSortUp : sortDirection === 'desc' ? FaSortDown : FaSort;

  return (
    <th
      scope={scope}
      aria-sort={ariaSort}
      className={cn('px-4 py-3 font-bold', ALIGN[align], className)}
      {...rest}
    >
      {srOnly ? (
        <span className="sr-only">{children}</span>
      ) : sortable && onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            'inline-flex min-h-11 items-center gap-1.5 rounded px-1 font-bold uppercase tracking-wide text-slate-700 hover:text-[color:var(--brand-navy)]',
            align === 'right' && 'flex-row-reverse',
          )}
        >
          {children}
          <SortIcon
            aria-hidden="true"
            className={cn('h-3 w-3 shrink-0', sortDirection ? 'text-teal-700' : 'text-slate-400')}
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TDProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: CellAlign;
  /** Tabular figures, for money and counts. */
  numeric?: boolean;
}

export function TD({ align = 'left', numeric = false, className, children, ...rest }: TDProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-slate-800',
        ALIGN[align],
        numeric && 'tabular-nums',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

export default Table;
