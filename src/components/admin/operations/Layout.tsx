/**
 * Page furniture shared by the four operations screens: the heading block,
 * the filter panel above a list, and the label/value grid used throughout the
 * shipment detail view.
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/kit";

export interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  /** Right-aligned actions, usually a primary `Button`. */
  actions?: React.ReactNode;
  /** Rendered above the title, for `Breadcrumbs`. */
  above?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  above,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6 space-y-2", className)}>
      {above}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold text-[color:var(--brand-navy)] sm:text-3xl">
            {title}
          </h1>
          {description && <p className="max-w-prose text-sm text-slate-600">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export interface FilterPanelProps {
  /** Form controls. Laid out in a responsive grid. */
  children: React.ReactNode;
  /** Full-width row above the grid, usually the search box. */
  lead?: React.ReactNode;
  /** Number of filters away from their default, shown on the clear button. */
  activeCount?: number;
  onClear?: () => void;
  /** Accessible name for the region. */
  label?: string;
  /** Extra line under the controls, e.g. a note about client-side matching. */
  note?: React.ReactNode;
  className?: string;
}

/**
 * The filter block above a worklist. A region rather than a form: every
 * control applies on change, so there is nothing to submit.
 */
export function FilterPanel({
  children,
  lead,
  activeCount = 0,
  onClear,
  label = "Filters",
  note,
  className,
}: FilterPanelProps) {
  return (
    <section aria-label={label} className={cn("panel mb-6 space-y-4 p-5!", className)}>
      {lead}
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
      {(note || onClear) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <p className="text-xs text-slate-600">{note}</p>
          {onClear && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={activeCount === 0}
            >
              Clear filters
              {activeCount > 0 && ` (${activeCount})`}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

export interface DetailItem {
  label: string;
  value: React.ReactNode;
  /** Let the value span the full width, for addresses and notes. */
  wide?: boolean;
}

export interface DescriptionListProps {
  items: DetailItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

/** Label/value grid as a real `<dl>`, so the pairing survives a screen reader. */
export function DescriptionList({ items, columns = 2, className }: DescriptionListProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-4",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn("min-w-0 space-y-1", item.wide && "sm:col-span-full")}
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {item.label}
          </dt>
          <dd className="break-words text-sm text-slate-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Inline error block for a failed read. Mutations report through toasts; a
 * query that never loaded has nothing to show, so it says so in place.
 */
export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="panel border-red-200! bg-red-50! text-sm text-red-900">
      <p className="font-semibold">That did not load.</p>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
