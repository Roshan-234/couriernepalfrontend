const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

function middleware(env = {}) {
  const source = fs.readFileSync('src/middleware.ts', 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, require, URL, Headers, Buffer,
    crypto: require('node:crypto').webcrypto,
    process: { env: { NODE_ENV: 'production', ...env } },
  });
  return exports.middleware;
}

test('loopback login redirects preserve the browser host', () => {
  const request = new NextRequest('http://localhost:3100/dashboard/create-shipment', {
    headers: { host: '127.0.0.1:3100' },
  });
  const response = middleware()(request);
  const url = new URL(response.headers.get('location'));
  assert.equal(url.origin, 'http://127.0.0.1:3100');
  assert.equal(url.pathname, '/auth/login');
  assert.equal(url.searchParams.get('redirect'), '/dashboard/create-shipment');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('production redirects use the public origin behind Passenger', () => {
  const request = new NextRequest('http://localhost:3000/admin/content', {
    headers: { host: 'untrusted.example' },
  });
  const response = middleware({ SITE_URL: 'https://couriernepal.com' })(request);
  assert.equal(new URL(response.headers.get('location')).origin, 'https://couriernepal.com');
});

test('the API proxy replaces an incoming backend key with its own server setting', () => {
  const request = new NextRequest('https://couriernepal.com/api/health', {
    headers: { 'X-Backend-Key': 'caller-controlled-value' },
  });
  const response = middleware({ BACKEND_PROXY_SECRET: 'test-only-server-key' })(request);
  assert.equal(response.headers.get('x-middleware-request-x-backend-key'), 'test-only-server-key');
});

// A nonce is minted per request, so a page that carries one can never be
// prerendered. Applying the nonce policy everywhere is what forced all 79
// routes to render on demand and emit no HTML, which on shared hosting is
// a React server render for every page view. The policy is now split, and
// these tests pin both halves of that split.

test('the signed-in areas keep a distinct nonce and disallow eval', () => {
  const run = middleware();
  const first = run(new NextRequest('https://couriernepal.com/auth/login'));
  const second = run(new NextRequest('https://couriernepal.com/auth/login'));
  const policy = first.headers.get('Content-Security-Policy');
  assert.match(policy, /'nonce-[^']+'/);
  assert.match(policy, /'strict-dynamic'/);
  assert.doesNotMatch(policy, /unsafe-eval/);
  assert.doesNotMatch(policy, /script-src[^;]*unsafe-inline/);
  // A fresh nonce per request, or it is not a nonce.
  assert.notEqual(policy, second.headers.get('Content-Security-Policy'));
});

test('public pages get a policy a static file can satisfy', () => {
  const run = middleware();
  const policy = run(new NextRequest('https://couriernepal.com/pricing'))
    .headers.get('Content-Security-Policy');
  assert.doesNotMatch(policy, /'nonce-/);
  assert.match(policy, /script-src 'self' 'unsafe-inline'/);
  assert.doesNotMatch(policy, /unsafe-eval/);
});

test('the protections that do not depend on a nonce are on both policies', () => {
  // What the public policy gives up is inline-script nonces, not the header.
  const run = middleware();
  for (const path of ['/pricing', '/auth/login']) {
    const policy = run(new NextRequest(`https://couriernepal.com${path}`))
      .headers.get('Content-Security-Policy');
    for (const directive of ["object-src 'none'", "base-uri 'self'",
                             "form-action 'self'", "frame-ancestors 'none'",
                             "default-src 'self'", "connect-src 'self'"]) {
      assert.ok(policy.includes(directive), `${path} is missing ${directive}`);
    }
  }
});

test('every privileged path that renders is on the strict policy', () => {
  // A signed-out visitor to /admin is redirected, and a redirect carries no
  // HTML to protect, so it carries no policy either. Only the responses
  // that actually render a document are asserted on.
  const run = middleware();
  let checked = 0;
  for (const path of ['/admin', '/admin/reviews', '/dashboard',
                      '/dashboard/shipments', '/auth/login',
                      '/blog/a-post/edit']) {
    const response = run(new NextRequest(`https://couriernepal.com${path}`));
    const policy = response.headers.get('Content-Security-Policy');
    if (policy === null) {
      assert.ok(response.headers.get('location'),
        `${path} returned no policy and is not a redirect`);
      continue;
    }
    assert.match(policy, /'nonce-[^']+'/, `${path} should carry a nonce`);
    checked += 1;
  }
  assert.ok(checked > 0, 'no privileged path actually rendered');
});

test('the API proxy forwards the visitor address and overwrites a forged one', () => {
  // Flask sees this proxy as the peer on every request, so without a
  // forwarded address its rate limits become one bucket shared by every
  // visitor. The value must come from the hosting layer, never the caller.
  const request = new NextRequest('https://couriernepal.com/api/health', {
    headers: {
      'x-forwarded-for': '203.0.113.9, 10.0.0.1',
      'X-Real-Client-IP': 'attacker-supplied',
    },
  });
  const response = middleware({ BACKEND_PROXY_SECRET: 'test-only-server-key' })(request);
  assert.equal(
    response.headers.get('x-middleware-request-x-real-client-ip'),
    '203.0.113.9',
    'the leftmost forwarded address is the visitor',
  );
});

test('the API proxy falls back to x-real-ip when no chain is present', () => {
  const request = new NextRequest('https://couriernepal.com/api/health', {
    headers: { 'x-real-ip': '198.51.100.7' },
  });
  const response = middleware({ BACKEND_PROXY_SECRET: 'k' })(request);
  assert.equal(response.headers.get('x-middleware-request-x-real-client-ip'), '198.51.100.7');
});

test('the policy no longer allows connections to the analytics vendors', () => {
  // Google Analytics was removed from the product; visit counting is
  // first-party and goes through this app's own /api proxy. An allowlist
  // entry that outlives the script it was written for is a door left open
  // for whatever loads next.
  const policy = middleware()(new NextRequest('https://couriernepal.com/')).headers.get(
    'Content-Security-Policy',
  );
  assert.doesNotMatch(policy, /google/i);
  assert.match(policy, /connect-src 'self'(;|$)/);
});
