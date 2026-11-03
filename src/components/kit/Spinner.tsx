import { cn } from '@/lib/utils';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

const SPINNER_SIZES: Record<SpinnerSize, string> = {
  xs: 'h-3.5 w-3.5 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-[3px]',
};

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  /** Announced to screen readers unless `decorative` is set. */
  label?: string;
  /** Use when a parent element already communicates the busy state. */
  decorative?: boolean;
}

/**
 * Indeterminate activity indicator. Teal arc on a slate track so it reads on
 * both white panels and the slate page background.
 */
export function Spinner({
  size = 'md',
  label = 'Loading',
  decorative = false,
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative || undefined}
      className={cn('inline-flex items-center justify-center', className)}
      {...rest}
    >
      <span
        className={cn(
          'animate-spin rounded-full border-slate-200 border-t-[color:var(--brand-teal)]',
          SPINNER_SIZES[size],
        )}
      />
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  );
}

export default Spinner;
