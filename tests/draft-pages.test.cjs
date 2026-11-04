const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// A page that still carries a [TO CONFIRM] marker is half-written, and the
// marker renders to the public as an amber highlight. Indexing that under a
// twenty-year-old company's name costs more than a page Google has not found
// yet, so the rule is simple and mechanical: markers and indexability are
// mutually exclusive, and the sitemap must agree with the page's own robots
// tag rather than contradict it.

const APP = path.join(__dirname, '..', 'src', 'app');

function pageFiles(dir = APP, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) pageFiles(full, found);
    else if (entry.name === 'page.tsx') found.push(full);
  }
  return found;
}

const routeOf = (file) =>
  '/' + path.relative(APP, path.dirname(file)).split(path.sep).join('/');

test('a page with unresolved [TO CONFIRM] markers is not indexable', () => {
  const offenders = [];
  for (const file of pageFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes('<ToConfirm')) continue;
    if (!source.includes('noindex: true')) offenders.push(routeOf(file));
  }
  assert.deepEqual(
    offenders,
    [],
    `these pages show [TO CONFIRM] markers to the public and are indexable: ` +
      `${offenders.join(', ')}. Either fill the figures in or add ` +
      `noindex: true to buildMetadata.`,
  );
});

test('the sitemap does not advertise a noindex page', () => {
  // Listing a page in the sitemap while its own robots tag says noindex is
  // a contradiction search engines resolve by trusting neither.
  const sitemap = fs.readFileSync(path.join(APP, 'sitemap.ts'), 'utf8');

  // The route table and the EXCLUDED set both hold quoted paths, so read
  // the table first and subtract what is deliberately withheld. A first
  // version of this matched both and reported /terms, which the sitemap
  // already excludes at runtime.
  const table = sitemap.slice(
    sitemap.indexOf('const STATIC_ROUTES'),
    sitemap.indexOf('const EXCLUDED'),
  );
  const excludedBlock = sitemap.slice(sitemap.indexOf('const EXCLUDED'));
  const excluded = new Set(
    [...excludedBlock.matchAll(/'(\/[a-z0-9-/]*)'/g)].map((m) => m[1]),
  );
  const listed = [...table.matchAll(/\['(\/[a-z0-9-/]*)',/g)]
    .map((m) => m[1])
    .filter((route) => !excluded.has(route));

  const noindexed = pageFiles()
    .filter((file) => fs.readFileSync(file, 'utf8').includes('noindex: true'))
    .map(routeOf);

  const contradictions = noindexed.filter((route) => listed.includes(route));
  assert.deepEqual(
    contradictions,
    [],
    `listed in the sitemap but marked noindex: ${contradictions.join(', ')}`,
  );
});

test('the pages that are still drafts are the ones we expect', () => {
  // A tripwire, not a target. If this list shrinks somebody has filled the
  // gaps in — update it. If it grows, a new page shipped half-written.
  const expected = [
    '/business',
    '/careers',
    '/customs-guide',
    '/packing-guide',
    '/prohibited-items',
    '/refund-policy',
    '/terms',
  ].sort();

  const actual = pageFiles()
    .filter((file) => fs.readFileSync(file, 'utf8').includes('<ToConfirm'))
    .map(routeOf)
    .sort();

  assert.deepEqual(actual, expected);
});

test('the pages customers actually transact on carry no markers', () => {
  // Whatever else is still a draft, these have to be finished: they are the
  // route from a search result to a booking.
  const critical = ['/', '/pricing', '/tracking', '/services', '/contact', '/faq'];
  for (const route of critical) {
    const file = path.join(APP, route === '/' ? '' : route.slice(1), 'page.tsx');
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(
      !source.includes('<ToConfirm'),
      `${route} is on the path to a booking and still has unfilled figures`,
    );
    assert.ok(
      !source.includes('noindex: true'),
      `${route} earns the company money and must be indexable`,
    );
  }
});
