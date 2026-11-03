import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Body copy at a readable measure.
 *
 * Long legal and explanatory text is unreadable at the full width of a
 * 1200px container, so every run of prose on these pages is capped at roughly
 * 68 characters per line.
 */
export function Prose({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("max-w-[68ch] space-y-4 text-[15px] leading-7 text-slate-700", className)}>
      {children}
    </div>
  );
}

export interface SectionProps {
  /** Used for the heading id and as an anchor target. */
  id: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A labelled landmark, so the page outline is navigable by heading. */
export function Section({ id, title, lede, children, className }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn("scroll-mt-24", className)}>
      <h2
        id={`${id}-heading`}
        className="text-2xl font-bold text-[color:var(--brand-navy)] sm:text-[1.7rem]"
      >
        {title}
      </h2>
      {lede ? <p className="mt-3 max-w-[68ch] leading-7 text-slate-600">{lede}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

/** A plain bulleted list at the prose measure. */
export function Bullets({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "max-w-[68ch] list-disc space-y-2 pl-5 text-[15px] leading-7 text-slate-700",
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/** A numbered list, for anything the reader does in order. */
export function Steps({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ol
      className={cn(
        "max-w-[68ch] list-decimal space-y-2 pl-5 text-[15px] leading-7 text-slate-700",
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}
