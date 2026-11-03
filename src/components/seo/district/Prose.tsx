/**
 * Two small typographic primitives shared by the cluster pages, so the
 * reading rhythm is identical on all 79 of them without each page restating
 * the same Tailwind classes.
 */

export function SectionHeading({
  as: Tag = "h2",
  id,
  children,
}: {
  as?: "h2" | "h3";
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={
        Tag === "h2"
          ? "text-xl font-bold text-[color:var(--brand-navy)] sm:text-2xl"
          : "text-base font-bold text-[color:var(--brand-navy)]"
      }
    >
      {children}
    </Tag>
  );
}

/** Body copy at a comfortable measure, dark enough to pass contrast. */
export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 text-[15px] leading-8 text-slate-700">{children}</div>;
}

export default Prose;
