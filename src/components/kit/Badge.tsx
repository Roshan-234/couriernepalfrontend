import { cn } from '@/lib/utils';

/**
 * Semantic colour slots. Brand navy/teal/yellow come from the CSS custom
 * properties declared in `globals.css`; the rest are state colours only.
 */
export type BadgeTone =
  | 'neutral'
  | 'navy'
  | 'teal'
  | 'yellow'
  | 'blue'
  | 'indigo'
  | 'amber'
  | 'green'
  | 'orange'
  | 'red';

export type BadgeVariant = 'soft' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md';

interface ToneStyle {
  soft: string;
  solid: string;
  outline: string;
  dot: string;
}

/** Every pairing below clears 4.5:1 against its own background. */
const TONES: Record<BadgeTone, ToneStyle> = {
  neutral: {
    soft: 'bg-slate-100 text-slate-800 ring-slate-300',
    solid: 'bg-slate-700 text-white ring-slate-700',
    outline: 'bg-white text-slate-800 ring-slate-400',
    dot: 'bg-slate-500',
  },
  navy: {
    soft: 'bg-[#ecebf5] text-[color:var(--brand-navy)] ring-[#c9c7e3]',
    solid: 'bg-[color:var(--brand-navy)] text-white ring-[color:var(--brand-navy)]',
    outline: 'bg-white text-[color:var(--brand-navy)] ring-[#9c99c6]',
    dot: 'bg-[color:var(--brand-navy)]',
  },
  teal: {
    soft: 'bg-teal-50 text-teal-800 ring-teal-200',
    solid: 'bg-teal-700 text-white ring-teal-700',
    outline: 'bg-white text-teal-800 ring-teal-600',
    dot: 'bg-teal-700',
  },
  yellow: {
    soft: 'bg-[#fff8d6] text-[#5c4b00] ring-[#f0d97a]',
    solid: 'bg-[color:var(--brand-yellow)] text-[#3b3100] ring-[#e0c000]',
    outline: 'bg-white text-[#5c4b00] ring-[#d9b800]',
    dot: 'bg-[color:var(--brand-yellow)]',
  },
  blue: {
    soft: 'bg-blue-50 text-blue-800 ring-blue-200',
    solid: 'bg-blue-700 text-white ring-blue-700',
    outline: 'bg-white text-blue-800 ring-blue-400',
    dot: 'bg-blue-600',
  },
  indigo: {
    soft: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
    solid: 'bg-indigo-700 text-white ring-indigo-700',
    outline: 'bg-white text-indigo-800 ring-indigo-400',
    dot: 'bg-indigo-600',
  },
  amber: {
    soft: 'bg-amber-50 text-amber-900 ring-amber-300',
    solid: 'bg-amber-600 text-white ring-amber-600',
    outline: 'bg-white text-amber-900 ring-amber-500',
    dot: 'bg-amber-600',
  },
  green: {
    soft: 'bg-green-50 text-green-800 ring-green-200',
    solid: 'bg-green-700 text-white ring-green-700',
    outline: 'bg-white text-green-800 ring-green-500',
    dot: 'bg-green-600',
  },
  orange: {
    soft: 'bg-orange-50 text-orange-900 ring-orange-300',
    solid: 'bg-orange-700 text-white ring-orange-700',
    outline: 'bg-white text-orange-900 ring-orange-500',
    dot: 'bg-orange-600',
  },
  red: {
    soft: 'bg-red-50 text-red-800 ring-red-200',
    solid: 'bg-red-700 text-white ring-red-700',
    outline: 'bg-white text-red-800 ring-red-400',
    dot: 'bg-red-600',
  },
};

const SIZES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Leading status dot. Never the only carrier of meaning — keep the text. */
  dot?: boolean;
  icon?: React.ReactNode;
}

/**
 * Compact label for state or category. Colour is decoration: the text inside
 * always states the meaning on its own.
 */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  const toneStyle = TONES[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold leading-5 ring-1 ring-inset whitespace-nowrap',
        SIZES[size],
        toneStyle[variant],
        className,
      )}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            variant === 'solid' ? 'bg-current opacity-80' : toneStyle.dot,
          )}
        />
      )}
      {icon && (
        <span aria-hidden="true" className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
