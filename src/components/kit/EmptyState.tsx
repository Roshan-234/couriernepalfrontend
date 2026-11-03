import { cn } from '@/lib/utils';

export type EmptyStateSize = 'sm' | 'md';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  description?: React.ReactNode;
  /** Decorative glyph, usually a `react-icons` element. */
  icon?: React.ReactNode;
  /** Primary call to action, usually a `Button`. */
  action?: React.ReactNode;
  /** Secondary call to action. */
  secondaryAction?: React.ReactNode;
  size?: EmptyStateSize;
}

/**
 * "Nothing here yet" panel for empty lists, tables and search results.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  size = 'md',
  className,
  children,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14',
        className,
      )}
      {...rest}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            'flex items-center justify-center rounded-full bg-teal-50 text-teal-700',
            size === 'sm' ? 'h-10 w-10 text-lg' : 'h-14 w-14 text-2xl',
          )}
        >
          {icon}
        </span>
      )}
      <h3
        className={cn(
          'font-bold text-[color:var(--brand-navy)]',
          size === 'sm' ? 'text-sm' : 'text-lg',
        )}
      >
        {title}
      </h3>
      {description && (
        <p className="max-w-prose text-sm text-slate-600">{description}</p>
      )}
      {children}
      {(action || secondaryAction) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
