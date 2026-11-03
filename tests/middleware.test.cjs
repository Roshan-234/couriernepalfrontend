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

test('public HTML gets a distinct nonce and disallows eval in production', () => {
  const run = middleware();
  const first = run(new NextRequest('https://couriernepal.com/'));
  const second = run(new NextRequest('https://couriernepal.com/'));
  const policy = first.headers.get('Content-Security-Policy');
  assert.match(policy, /'nonce-[^']+'/);
  assert.doesNotMatch(policy, /unsafe-eval/);
  assert.notEqual(policy, second.headers.get('Content-Security-Policy'));
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
