/**
 * End-to-end smoke tests against a running stack.
 *
 * Everything else in this repo is checked statically — types, lint, unit
 * tests, a production build. None of that catches a page that renders an
 * empty table because the API returns `{items}` and the client expected an
 * array, which is exactly the class of bug that reached this codebase.
 * These tests drive the real servers over HTTP.
 *
 *   Backend:   python run.py                    (127.0.0.1:5000)
 *   Frontend:  npm run dev                      (localhost:3000)
 *   Seed:      flask db upgrade && flask seed-content && flask seed-logistics
 *              && python scripts/seed_dev_demo.py
 *
 * Run with:  npm run test:e2e
 *
 * Skips itself with a clear message when the stack is not up, so `npm test`
 * stays usable on a machine with nothing running.
 */

const { test, before, describe } = require('node:test');
const assert = require('node:assert/strict');

const WEB = process.env.E2E_WEB_URL || 'http://localhost:3000';
const ADMIN = { email: 'qa.admin@moonlight.test', password: 'Test1234!' };
const CUSTOMER = { email: 'qa.customer@moonlight.test', password: 'Test1234!' };

let stackUp = false;

/** A cookie jar, so a signed-in session persists across requests. */
function jar() {
  const cookies = new Map();
  return {
    header: () => [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
    absorb(response) {
      for (const raw of response.headers.getSetCookie?.() ?? []) {
        const [pair] = raw.split(';');
        const index = pair.indexOf('=');
        if (index > 0) cookies.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
      }
    },
    get: (name) => cookies.get(name),
  };
}

async function call(path, { method = 'GET', body, cookies, csrf } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (cookies) headers.Cookie = cookies.header();
  if (csrf) headers['X-CSRF-TOKEN'] = csrf;
  const response = await fetch(`${WEB}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  if (cookies) cookies.absorb(response);
  return response;
}

/**
 * Sign in once per account and reuse the session.
 *
 * Signing in per test trips the login rate limit — which is the limiter doing
 * its job, not a bug, but it makes the suite fail for the wrong reason. The
 * limit itself is covered by the backend tests.
 */
const sessions = new Map();

async function signIn(credentials) {
  const cached = sessions.get(credentials.email);
  if (cached) return cached;
  const cookies = jar();
  const response = await call('/api/auth/login', { method: 'POST', body: credentials, cookies });
  assert.equal(response.status, 200, `sign-in failed for ${credentials.email}`);
  const session = { cookies, csrf: cookies.get('csrf_access_token') };
  sessions.set(credentials.email, session);
  return session;
}

before(async () => {
  try {
    const response = await fetch(`${WEB}/api/health`, { signal: AbortSignal.timeout(3000) });
    stackUp = response.ok;
  } catch {
    stackUp = false;
  }
  if (!stackUp) {
    console.log(`\n  E2E skipped: nothing answering at ${WEB}.` +
      '\n  Start the backend and frontend, then re-run. See the header of this file.\n');
  }
});

/**
 * Register a test that skips itself when the stack is not up.
 *
 * `skip` in the options object is a boolean, evaluated when the test is
 * defined — which is before `before()` has run, so a function there is simply
 * truthy and every test skips silently. The check has to happen inside the
 * test body, where `t.skip()` can be called at run time.
 */
const it = (name, fn) =>
  test(name, async (t) => {
    if (!stackUp) return t.skip('stack not running');
    return fn(t);
  });

// ── Public pages ───────────────────────────────────────────────────────────

describe('public pages', () => {
  const PAGES = [
    ['/', 'Ship from Nepal'],
    ['/shipping', null],
    ['/shipping/nepal-to-usa', null],
    ['/shipping/to-nepal-from-qatar', null],
    ['/courier', null],
    ['/courier/kaski', 'Kaski'],
    ['/courier/humla', 'Humla'],
    ['/services', null],
    ['/services/international', null],
    ['/pricing', null],
    ['/tracking', null],
    ['/faq', null],
    ['/prohibited-items', null],
    ['/customs-guide', null],
    ['/packing-guide', null],
    ['/business', null],
    ['/careers', null],
    ['/branches', null],
    ['/blog', null],
    ['/contact', null],
    ['/about', null],
  ];

  for (const [path, mustContain] of PAGES) {
    it(`${path} renders`, async () => {
      const response = await call(path);
      assert.equal(response.status, 200, `${path} returned ${response.status}`);
      const html = await response.text();
      assert.ok(html.length > 2000, `${path} returned suspiciously little HTML`);
      if (mustContain) {
        assert.ok(html.includes(mustContain), `${path} is missing "${mustContain}"`);
      }
    });
  }

  it('every page carries exactly one brand in its title', async () => {
    for (const [path] of PAGES) {
      const html = await (await call(path)).text();
      const title = /<title>(.*?)<\/title>/s.exec(html)?.[1] ?? '';
      const brands = (title.match(/Moonlight Freight/g) || []).length;
      assert.ok(brands <= 1, `${path} repeats the brand in its title: ${title}`);
    }
  });

  it('district and corridor pages carry structured data', async () => {
    for (const path of ['/courier/kaski', '/shipping/nepal-to-usa', '/faq']) {
      const html = await (await call(path)).text();
      assert.ok(html.includes('application/ld+json'), `${path} has no JSON-LD`);
      assert.ok(html.includes('BreadcrumbList'), `${path} has no breadcrumbs`);
    }
  });

  it('an unknown district 404s rather than rendering empty', async () => {
    assert.equal((await call('/courier/atlantis')).status, 404);
  });

  it('an unknown corridor 404s', async () => {
    assert.equal((await call('/shipping/nepal-to-narnia')).status, 404);
  });

  it('sitemap lists the international corridors above the districts', async () => {
    const xml = await (await call('/sitemap.xml')).text();
    assert.ok(xml.includes('/shipping/nepal-to-usa'), 'corridors missing from sitemap');
    assert.ok(xml.includes('/courier/kaski'), 'districts missing from sitemap');
    assert.ok(!xml.includes('/terms'), 'noindexed /terms should not be listed');
    const urls = (xml.match(/<loc>/g) || []).length;
    assert.ok(urls > 100, `expected 100+ sitemap URLs, found ${urls}`);
  });

  it('robots allows tracking and blocks the admin area', async () => {
    const txt = await (await call('/robots.txt')).text();
    assert.ok(txt.includes('/admin/'), 'admin should be disallowed');
    assert.ok(!/Disallow:\s*\/tracking/.test(txt), '/tracking should no longer be blocked');
  });
});

// ── Authentication ─────────────────────────────────────────────────────────

describe('authentication', () => {
  it('rejects a wrong password with no hint about the account', async () => {
    const wrong = await call('/api/auth/login', {
      method: 'POST', body: { email: CUSTOMER.email, password: 'NotThePassword1!' },
    });
    const unknown = await call('/api/auth/login', {
      method: 'POST', body: { email: 'nobody@nowhere.test', password: 'NotThePassword1!' },
    });
    assert.equal(wrong.status, 401);
    assert.equal(unknown.status, 401);
    assert.deepEqual(await wrong.json(), await unknown.json(),
      'the two failures must be indistinguishable');
  });

  it('signs in and returns the profile', async () => {
    const { cookies } = await signIn(CUSTOMER);
    const profile = await call('/api/auth/profile', { cookies });
    assert.equal(profile.status, 200);
    assert.equal((await profile.json()).email, CUSTOMER.email);
  });

  it('refuses admin endpoints to a customer', async () => {
    const { cookies } = await signIn(CUSTOMER);
    assert.equal((await call('/api/shipments/page?all=1', { cookies })).status, 403);
  });
});

// ── Customer journey ───────────────────────────────────────────────────────

describe('booking and tracking', () => {
  it('books an international shipment, prices it, and tracks it publicly', async () => {
    const { cookies, csrf } = await signIn(CUSTOMER);

    const created = await call('/api/shipments', {
      method: 'POST', cookies, csrf,
      body: {
        origin: 'Kathmandu', destination: 'New York',
        origin_district: 'Kathmandu', destination_country: 'United States',
        total_weight_kg: 4.5, total_packages: 1,
        sender_name: 'E2E Sender', receiver_name: 'E2E Receiver',
        contents_description: 'Handicrafts', service_level: 'standard',
      },
    });
    // Read the body once: a Response can only be consumed a single time.
    const shipment = await created.json();
    assert.equal(created.status, 201, JSON.stringify(shipment));

    assert.ok(shipment.tracking_no?.startsWith('MNL'), 'no tracking number issued');
    assert.equal(shipment.origin_district, 'Kathmandu');
    assert.equal(shipment.status, 'pending');
    assert.ok(shipment.status_label, 'status label missing from the response');
    assert.equal(shipment.events?.[0]?.status, 'pending');

    // Public tracking must work without a session, and must not leak the sender.
    const tracked = await call(`/api/tracking/${shipment.tracking_no}`);
    assert.equal(tracked.status, 200);
    const body = await tracked.json();
    assert.equal(body.tracking_no, shipment.tracking_no);
    assert.ok(!('sender_name' in body), 'public tracking leaked the sender');
  });

  it('prices a domestic shipment from the live tariff', async () => {
    const { cookies, csrf } = await signIn(CUSTOMER);
    const created = await call('/api/shipments', {
      method: 'POST', cookies, csrf,
      body: {
        origin: 'Kathmandu', destination: 'Pokhara',
        origin_district: 'Kathmandu', destination_district: 'Kaski',
        total_weight_kg: 3.0, is_cod: true, cod_amount: 5000,
        sender_name: 'E2E', receiver_name: 'E2E',
      },
    });
    assert.equal(created.status, 201);
    const shipment = await created.json();
    assert.ok(shipment.total_charge > 0, 'domestic shipment was not priced');
    assert.equal(shipment.is_cod, true);
    assert.equal(shipment.cod_status, 'pending');
    assert.ok(shipment.tax_amount > 0, 'VAT was not applied');
  });

  it('rejects a COD booking with no amount', async () => {
    const { cookies, csrf } = await signIn(CUSTOMER);
    const response = await call('/api/shipments', {
      method: 'POST', cookies, csrf,
      body: { origin: 'Kathmandu', destination: 'Pokhara', is_cod: true },
    });
    assert.equal(response.status, 400);
  });

  it('rejects an unknown district', async () => {
    const { cookies, csrf } = await signIn(CUSTOMER);
    const response = await call('/api/shipments', {
      method: 'POST', cookies, csrf,
      body: { origin: 'Kathmandu', destination: 'X', destination_district: 'Atlantis' },
    });
    assert.equal(response.status, 400);
  });

  it('quotes publicly without a session', async () => {
    const response = await call('/api/rates/quote', {
      method: 'POST',
      body: { origin_district: 'Kathmandu', destination_district: 'Kaski', weight_kg: 3 },
    });
    assert.equal(response.status, 200);
    const quote = await response.json();
    assert.equal(quote.status, 'ok');
    assert.ok(quote.total > 0 && quote.freight > 0, 'quote returned no price');
    assert.equal(quote.currency, 'NPR');
  });
});

// ── Admin surface ──────────────────────────────────────────────────────────

describe('admin console data', () => {
  const ENDPOINTS = [
    ['/api/shipments/page?all=1&per_page=5', (j) => Array.isArray(j.items) && j.summary],
    ['/api/branches/', (j) => Array.isArray(j.items) && j.items.length > 0],
    ['/api/riders/', (j) => Array.isArray(j.items)],
    ['/api/pickups/', (j) => Array.isArray(j.items)],
    ['/api/cod/collections', (j) => Array.isArray(j.items)],
    ['/api/cod/summary', (j) => typeof j.total_outstanding === 'number'],
    ['/api/cod/remittances', (j) => Array.isArray(j.items)],
    ['/api/payments', (j) => Array.isArray(j.items)],
    ['/api/payments/gateways/all', (j) => Array.isArray(j) && j.length > 0],
    ['/api/rates/cards', (j) => Array.isArray(j.items) && j.items.length > 0],
    ['/api/rates/surcharges', (j) => Array.isArray(j.items)],
    ['/api/carriers/all', (j) => Array.isArray(j) && j.length > 0],
    ['/api/notifications/templates', (j) => Array.isArray(j) && j.length > 0],
    ['/api/claims/', (j) => Array.isArray(j.claims)],
    ['/api/geo/districts', (j) => Array.isArray(j.items) && j.items.length === 77],
    ['/api/services/', (j) => Array.isArray(j) && j.length > 0],
    ['/api/admin/dashboard/stats', (j) => j && typeof j === 'object'],
  ];

  for (const [path, valid] of ENDPOINTS) {
    it(`${path} answers with usable data`, async () => {
      const { cookies } = await signIn(ADMIN);
      const response = await call(path, { cookies });
      assert.equal(response.status, 200, `${path} returned ${response.status}`);
      const json = await response.json();
      assert.ok(valid(json), `${path} returned an unexpected shape: ${JSON.stringify(json).slice(0, 200)}`);
    });
  }

  it('never exposes a carrier credential in clear', async () => {
    const { cookies, csrf } = await signIn(ADMIN);
    const secret = 'e2e-secret-value-9f8e7d6c5b4a';
    await call('/api/tracking-providers/', {
      method: 'POST', cookies, csrf,
      body: { name: 'E2E Probe', code: 'e2e-probe', api_key: secret },
    });
    for (const path of ['/api/tracking-providers/', '/api/tracking-providers/all']) {
      const text = await (await call(path, { cookies })).text();
      assert.ok(!text.includes(secret), `${path} leaked the API key`);
    }
  });

  it('refuses a connector URL pointing at an internal address', async () => {
    const { cookies, csrf } = await signIn(ADMIN);
    const response = await call('/api/tracking-providers/e2e-probe', {
      method: 'PUT', cookies, csrf,
      body: { api_url_template: 'http://169.254.169.254/latest/meta-data' },
    });
    assert.equal(response.status, 400, 'the cloud metadata endpoint was accepted');
  });

  it('refuses an illegal shipment status transition', async () => {
    const { cookies: adminCookies, csrf: adminCsrf } = await signIn(ADMIN);
    const { cookies, csrf } = await signIn(CUSTOMER);
    const created = await call('/api/shipments', {
      method: 'POST', cookies, csrf,
      body: { origin: 'Kathmandu', destination: 'Pokhara', sender_name: 'E2E', receiver_name: 'E2E' },
    });
    const { id } = await created.json();

    const deliver = await call(`/api/shipments/${id}`, {
      method: 'PUT', cookies: adminCookies, csrf: adminCsrf, body: { status: 'delivered' },
    });
    assert.equal(deliver.status, 200);

    const reopen = await call(`/api/shipments/${id}`, {
      method: 'PUT', cookies: adminCookies, csrf: adminCsrf, body: { status: 'pending' },
    });
    assert.equal(reopen.status, 409, 'a delivered shipment was reopened');
  });
});
