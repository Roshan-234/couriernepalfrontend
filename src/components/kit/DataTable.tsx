'use client';

import { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import { TBody, TD, TH, THead, TR, Table, type CellAlign, type SortDirection } from './Table';

/** Values the built-in client-side comparator understands. */
export type SortableValue = string | number | boolean | Date | null | undefined;

export interface DataTableColumn<T> {
  /** Stable key, also used as the sort key. */
  id: string;
  header: React.ReactNode;
  cell: (row: T, rowIndex: number) => React.ReactNode;
  /** Turns the header into a sort toggle. */
  sortable?: boolean;
  /** Value to sort on. Required for `sortMode="client"` to reorder rows. */
  sortValue?: (row: T) => SortableValue;
  align?: CellAlign;
  /** Inline width for the column, e.g. "12rem" or "20%". */
  width?: string;
  className?: string;
  headerClassName?: string;
  /** Leave this column out of the mobile card list. */
  hideOnMobile?: boolean;
  /** Use this column's cell as the heading of the mobile card. */
  primary?: boolean;
  /** Hide the header text visually (icon or action columns). */
  srOnlyHeader?: boolean;
}

export interface DataTableSort {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Stable React key per row. */
  rowKey: (row: T, index: number) => React.Key;
  /** Names the table for screen readers. Rendered as a caption. */
  caption: string;
  /** Show the caption above the table instead of only exposing it to AT. */
  captionVisible?: boolean;
  loading?: boolean;
  /** Placeholder rows drawn while loading. */
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  /** Replaces the default empty block entirely. */
  empty?: React.ReactNode;
  /** Controlled sort. Omit to let the table hold its own sort state. */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** "client" reorders rows here; "server" only reports the change. */
  sortMode?: 'client' | 'server';
  onRowClick?: (row: T, index: number) => void;
  density?: 'comfortable' | 'compact';
  /** Stack rows as cards below the md breakpoint. On by default. */
  mobileCards?: boolean;
  /** Card heading when no column is marked primary. */
  mobileTitle?: (row: T) => React.ReactNode;
  stickyHeader?: boolean;
  className?: string;
}

function toComparable(value: SortableValue): string | number {
  if (value === null || value === undefined) return Number.NEGATIVE_INFINITY;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
  return value.toLowerCase();
}

function compareValues(a: SortableValue, b: SortableValue): number {
  const left = toComparable(a);
  const right = toComparable(b);
  if (typeof left === 'string' && typeof right === 'string') return left.localeCompare(right);
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

/** asc then desc then unsorted. */
function nextSort(current: DataTableSort | null, columnId: string): DataTableSort | null {
  if (!current || current.columnId !== columnId) return { columnId, direction: 'asc' };
  if (current.direction === 'asc') return { columnId, direction: 'desc' };
  return null;
}

/**
 * Column-driven table with sorting, a loading skeleton, an empty state and a
 * card fallback on narrow screens. Headers are real th[scope=col] and carry
 * aria-sort; the caption names the table.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  captionVisible = false,
  loading = false,
  skeletonRows = 5,
  emptyTitle = 'Nothing to show',
  emptyDescription,
  emptyIcon,
  emptyAction,
  empty,
  sort,
  defaultSort = null,
  onSortChange,
  sortMode = 'client',
  onRowClick,
  density = 'comfortable',
  mobileCards = true,
  mobileTitle,
  stickyHeader = false,
  className,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<DataTableSort | null>(defaultSort);
  const activeSort = sort !== undefined ? sort : internalSort;

  const handleSort = useCallback(
    (columnId: string) => {
      const next = nextSort(activeSort, columnId);
      if (sort === undefined) setInternalSort(next);
      onSortChange?.(next);
    },
    [activeSort, onSortChange, sort],
  );

  const sortedRows = useMemo(() => {
    if (sortMode !== 'client' || !activeSort) return rows;
    const column = columns.find((candidate) => candidate.id === activeSort.columnId);
    if (!column?.sortValue) return rows;
    const direction = activeSort.direction === 'asc' ? 1 : -1;
    const getValue = column.sortValue;
    return [...rows].sort((a, b) => compareValues(getValue(a), getValue(b)) * direction);
  }, [activeSort, columns, rows, sortMode]);

  const cellPadding = density === 'compact' ? 'py-2' : 'py-3';
  const isEmpty = !loading && sortedRows.length === 0;

  const emptyBlock = empty ?? (
    <EmptyState
      title={emptyTitle}
      description={emptyDescription}
      icon={emptyIcon}
      action={emptyAction}
      size="sm"
    />
  );

  const table = (
    <Table caption={caption} captionVisible={captionVisible} aria-busy={loading || undefined}>
      <THead sticky={stickyHeader}>
        <tr>
          {columns.map((column) => (
            <TH
              key={column.id}
              align={column.align}
              sortable={column.sortable}
              srOnly={column.srOnlyHeader}
              sortDirection={activeSort?.columnId === column.id ? activeSort.direction : null}
              onSort={column.sortable ? () => handleSort(column.id) : undefined}
              style={column.width ? { width: column.width } : undefined}
              className={cn(cellPadding, column.headerClassName)}
            >
              {column.header}
            </TH>
          ))}
        </tr>
      </THead>
      <TBody>
        {loading &&
          Array.from({ length: skeletonRows }, (_, rowIndex) => (
            <tr key={'skeleton-' + rowIndex}>
              {columns.map((column) => (
                <TD key={column.id} className={cellPadding}>
                  <Skeleton height="0.875rem" />
                </TD>
              ))}
            </tr>
          ))}

        {isEmpty && (
          <tr>
            <td colSpan={columns.length} className="px-4 py-2">
              {emptyBlock}
            </td>
          </tr>
        )}

        {!loading &&
          sortedRows.map((row, rowIndex) => (
            <TR
              key={rowKey(row, rowIndex)}
              interactive={Boolean(onRowClick)}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === 'Enter' || event.key === 'Spacebar' || event.key === ' ') {
                        event.preventDefault();
                        onRowClick(row, rowIndex);
                      }
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <TD
                  key={column.id}
                  align={column.align}
                  className={cn(cellPadding, column.className)}
                >
                  {column.cell(row, rowIndex)}
                </TD>
              ))}
            </TR>
          ))}
      </TBody>
    </Table>
  );

  if (!mobileCards) {
    return <div className={className}>{table}</div>;
  }

  const cardColumns = columns.filter((column) => !column.hideOnMobile);
  const primaryColumn = columns.find((column) => column.primary);

  return (
    <div className={className}>
      <div className="hidden md:block">{table}</div>

      <div className="md:hidden">
        <h2 className="sr-only">{caption}</h2>

        {loading && (
          <ul className="space-y-3" aria-busy="true">
            {Array.from({ length: skeletonRows }, (_, index) => (
              <li key={'card-skeleton-' + index} className="panel p-4!">
                <Skeleton lines={3} />
              </li>
            ))}
          </ul>
        )}

        {isEmpty && <div className="panel">{emptyBlock}</div>}

        {!loading && sortedRows.length > 0 && (
          <ul className="space-y-3">
            {sortedRows.map((row, rowIndex) => (
              <li key={rowKey(row, rowIndex)} className="panel space-y-2 p-4!">
                {(primaryColumn || mobileTitle) && (
                  <div className="text-sm font-bold text-[color:var(--brand-navy)]">
                    {primaryColumn ? primaryColumn.cell(row, rowIndex) : mobileTitle?.(row)}
                  </div>
                )}
                <dl className="space-y-1.5">
                  {cardColumns
                    .filter((column) => column !== primaryColumn)
                    .map((column) => (
                      <div key={column.id} className="flex items-start justify-between gap-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {column.header}
                        </dt>
                        <dd className="min-w-0 text-right text-sm text-slate-800">
                          {column.cell(row, rowIndex)}
                        </dd>
                      </div>
                    ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DataTable;
