import { cn } from '@/lib/utils';

export type CardPadding = 'none' | 'sm' | 'md';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** `md` uses the global `.panel` padding; `sm` is tighter for dense grids. */
  padding?: CardPadding;
  /** Lift the card slightly, for cards that are also links or buttons. */
  interactive?: boolean;
  as?: 'div' | 'section' | 'article' | 'li';
}

/**
 * Surface container. Composes the global `.panel` class so radius, border and
 * background stay in step with the rest of the app.
 */
export function Card({
  padding = 'md',
  interactive = false,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        'panel',
        padding === 'none' && 'p-0!',
        padding === 'sm' && 'p-4!',
        interactive && 'transition-shadow hover:shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: React.ReactNode;
}

/** Title block with an optional right-aligned action slot. */
export function CardHeader({ actions, className, children, ...rest }: CardHeaderProps) {
  return (
    <div
      className={cn('flex flex-wrap items-start justify-between gap-3 pb-4', className)}
      {...rest}
    >
      <div className="min-w-0 space-y-1">{children}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ as: Tag = 'h3', className, children, ...rest }: CardTitleProps) {
  return (
    <Tag
      className={cn('text-base font-bold text-[color:var(--brand-navy)]', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardDescription({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-slate-600', className)} {...rest}>
      {children}
    </p>
  );
}

export function CardBody({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-slate-700', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
