import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

/**
 * `primary`, `accent` and `outline` compose the global `.action` classes from
 * `globals.css` so they stay identical to the buttons already in the app.
 * Those rules sit outside Tailwind's cascade layers, so any size override has
 * to be marked important — hence the `!` suffixes in SIZES.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'action',
  accent: 'action action-accent',
  outline: 'action action-outline',
  ghost:
    'min-h-12 rounded-[0.65rem] px-5 py-3 text-sm text-[color:var(--brand-navy)] hover:bg-slate-100 active:bg-slate-200',
  danger:
    'min-h-12 rounded-[0.65rem] px-5 py-3 text-sm bg-red-700 text-white hover:bg-red-800 active:bg-red-900',
  link: 'min-h-11 px-1 text-sm text-teal-800 underline underline-offset-4 hover:text-teal-700',
};

/** Every size keeps a tap target of at least 44px. */
const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-11! gap-1.5! px-4! py-2! text-xs!',
  md: '',
  lg: 'min-h-14! px-7! text-base!',
  icon: 'min-h-11! w-11 gap-0! px-0!',
};

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/**
 * The button look as a class string, for the rare element that has to be an
 * `<a>`/`<Link>` rather than a `<button>`.
 */
export function buttonClassNames({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonClassOptions = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 font-semibold transition-colors',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Swaps the leading icon for a spinner and disables the button. */
  loading?: boolean;
  /** Announced while `loading` is true. */
  loadingLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * The kit's button. `type` defaults to `button` so a button inside a form
 * never submits it by accident.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    loadingLabel = 'Working',
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassNames({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" label={loadingLabel} className="shrink-0" />
      ) : (
        leftIcon && (
          <span aria-hidden="true" className="shrink-0">
            {leftIcon}
          </span>
        )
      )}
      {children}
      {rightIcon && !loading && (
        <span aria-hidden="true" className="shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

export default Button;
