import type { ReactNode } from 'react';
import Link from 'next/link';
import { getPage } from '@/lib/content';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/kit';
import ToConfirm from '@/components/seo/pages/ToConfirm';
import PageIntro from './PageIntro';

/**
 * Matches an unresolved editorial note left in managed copy.
 *
 * The qualifier group is there because the notes are not uniform: most read
 * `[TO CONFIRM: …]`, but at least one is `[TO CONFIRM with an accountant:
 * …]`. A pattern that only knew the first form would quietly render the
 * second as policy text, which is the one outcome worth avoiding here.
 */
const TO_CONFIRM = /\[TO CONFIRM([^:\]]*):\s*([^\]]*)\]/g;

/** A managed body is plain text, so paragraphs are blank-line separated. */
function paragraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

export function hasEditorialNotes(sections: { body: string }[]): boolean {
  return sections.some((section) => /\[TO CONFIRM\b/.test(section.body));
}

/**
 * Managed body text with its `[TO CONFIRM: …]` notes marked up.
 *
 * Those brackets are questions for the business — a registration number, a
 * retention period — that nobody has answered yet. Deleting them would
 * publish a policy with a silent hole in it; leaving them as running text
 * would publish a question as though it were a commitment. They get the
 * same amber marker the hand-written legal pages use, so a reader can see
 * at a glance that the sentence is unfinished.
 */
function Body({ text }: { text: string }) {
  return (
    <>
      {paragraphs(text).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {annotate(paragraph)}
        </p>
      ))}
    </>
  );
}

function annotate(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(TO_CONFIRM)) {
    const start = match.index ?? 0;
    if (start > cursor) out.push(text.slice(cursor, start));
    out.push(
      <ToConfirm key={start} qualifier={match[1]}>
        {match[2]}
      </ToConfirm>,
    );
    cursor = start + match[0].length;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function slug(heading: string, index: number): string {
  const base = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return base || `section-${index + 1}`;
}

export type ManagedLayout = 'cards' | 'document' | 'auto';

export interface ManagedPageProps {
  /** Managed path to look up. `getPage` 404s when it is unknown. */
  path: string;
  /** Visible trail rendered above the heading. Omit on top-level pages. */
  trail?: BreadcrumbItem[];
  /**
   * How the section rows are laid out.
   *
   * `cards` is the original two-column grid, which suits the short, paired
   * rows the marketing pages carry. It stops working past a handful of
   * sections of real prose: the policy pages run to twelve, and a legal
   * document read in two columns of uneven cards is a document nobody
   * finishes. `document` gives those a single measured column, numbered
   * headings and a contents list. `auto` picks by length.
   */
  layout?: ManagedLayout;
  /**
   * Page-specific static content, rendered after the editor-managed
   * sections. The managed rows are deliberately short and shared between
   * sibling pages, so anything substantial belongs here.
   */
  children?: ReactNode;
}

/**
 * Renders an editor-managed page: eyebrow, heading, intro and the section
 * rows stored against the path, followed by whatever static content the
 * route passes as children.
 */
export default async function ManagedPage({ path, trail, layout = 'auto', children }: ManagedPageProps) {
  const page = await getPage(path);
  const asDocument = layout === 'document' || (layout === 'auto' && page.sections.length > 4);
  const notes = hasEditorialNotes(page.sections);

  return (
    <div className={asDocument ? 'container max-w-5xl py-12 sm:py-16' : 'container py-16 sm:py-20'}>
      {trail && trail.length > 0 && <Breadcrumbs items={trail} className="mb-6" />}

      <PageIntro page={page} />

      {asDocument && notes && (
        <aside
          role="note"
          aria-label="Editorial notes on this page"
          className="panel mb-10 max-w-[72ch] border-amber-300 bg-amber-50"
        >
          <p className="eyebrow text-amber-900">Editorial note — not part of the policy</p>
          <p className="mt-3 text-[15px] leading-7 text-amber-950">
            The highlighted <strong>[TO CONFIRM: …]</strong> passages below are questions for
            Moonlight Freight that are still open — a registered number, a retention period, the
            name of a processor. They are shown rather than hidden so nothing here reads as a
            commitment the company has not made. Ask us if one of them affects you.
          </p>
        </aside>
      )}

      {page.sections.length > 0 &&
        (asDocument ? (
          <>
            <nav aria-label="On this page" className="panel mb-10 max-w-[72ch]">
              <h2 className="text-sm font-bold uppercase tracking-[0.17em] text-[color:var(--brand-navy)]">
                On this page
              </h2>
              <ol className="mt-4 grid list-decimal gap-2 pl-5 text-[15px] leading-7 text-slate-700 sm:grid-cols-2">
                {page.sections.map((section, index) => (
                  <li key={index}>
                    <a
                      className="underline hover:text-[color:var(--brand-navy)]"
                      href={`#${slug(section.heading, index)}`}
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-10">
              {page.sections.map((section, index) => {
                const id = slug(section.heading, index);
                return (
                  <section key={index} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
                    <h2
                      id={`${id}-heading`}
                      className="text-2xl font-bold text-[color:var(--brand-navy)] sm:text-[1.7rem]"
                    >
                      {index + 1}. {section.heading}
                    </h2>
                    <div className="mt-4 max-w-[68ch] space-y-4 text-[15px] leading-7 text-slate-700">
                      <Body text={section.body} />
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {page.sections.map((section, index) => (
              <section className="panel" key={index}>
                <h2 className="text-xl font-bold">{section.heading}</h2>
                <div className="mt-4 space-y-4 leading-8 text-slate-600">
                  <Body text={section.body} />
                </div>
              </section>
            ))}
          </div>
        ))}

      {children}

      {path.startsWith('/services/') && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard/create-shipment" className="action">
            Create a shipment →
          </Link>
          <Link href="/contact" className="action action-outline">
            Talk to our team
          </Link>
        </div>
      )}
    </div>
  );
}
