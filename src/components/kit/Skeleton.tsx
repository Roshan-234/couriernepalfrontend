import { cn } from '@/lib/utils';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  /** For `variant="text"`: render this many stacked lines. */
  lines?: number;
}

const VARIANTS: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded',
  rect: 'rounded-lg',
  circle: 'rounded-full',
};

/**
 * Loading placeholder. Hidden from assistive tech: the surrounding region is
 * responsible for announcing that it is busy.
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const base = cn('animate-pulse bg-slate-200', VARIANTS[variant], className);
  const dimensions: React.CSSProperties = { width, height, ...style };

  if (variant === 'text' && lines > 1) {
    return (
      <div aria-hidden="true" className="space-y-2" {...rest}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={base}
            style={{
              ...dimensions,
              width: index === lines - 1 ? '70%' : dimensions.width ?? '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return <div aria-hidden="true" className={base} style={dimensions} {...rest} />;
}

export default Skeleton;
