const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// The page-view beacon is what replaced Google Analytics, so two of its
// properties are worth pinning rather than trusting: it never reports a
// path from behind a sign-in, and it copies only the three campaign
// parameters the server stores rather than the whole query string.
//
// Loaded the same way as seo-serialize.test.cjs: transpiled in a vm with
// a stubbed `@/config`, because the real one pulls in Next's environment.

function load() {
  const source = fs.readFileSync('src/lib/resources/analytics.ts', 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  const stubRequire = (name) =>
    name === '@/config' ? { API_BASE_URL: '/api' } : require(name);
  vm.runInNewContext(compiled, {
    exports, require: stubRequire, JSON, String, Object, URLSearchParams,
    // No `window`, so sendAnalyticsEvent returns early if anything calls it.
  });
  return exports;
}

test('paths behind a sign-in are never reported', () => {
  const { isMeasurablePath } = load();
  for (const path of [
    '/admin', '/admin/shipments', '/admin/shipments/4817',
    '/dashboard', '/dashboard/shipments/4817', '/dashboard/api-keys',
    '/auth', '/auth/login', '/auth/reset-password',
  ]) {
    assert.equal(isMeasurablePath(path), false, `${path} should not be measured`);
  }
});

test('public pages are reported', () => {
  const { isMeasurablePath } = load();
  for (const path of [
    '/', '/pricing', '/services', '/services/international', '/contact',
    '/tracking', '/blog', '/blog/a-post', '/cookies', '/privacy',
    '/data-requests', '/faq', '/shipping/nepal-to-uk', '/courier/kaski',
  ]) {
    assert.equal(isMeasurablePath(path), true, `${path} should be measured`);
  }
});

test('a public path that merely starts with a private word is still measured', () => {
  // `/administrative-areas` is not `/admin`. A naive startsWith on the bare
  // prefix would swallow it.
  const { isMeasurablePath } = load();
  assert.equal(isMeasurablePath('/administrative-areas'), true);
  assert.equal(isMeasurablePath('/authenticity'), true);
  assert.equal(isMeasurablePath('/dashboards-explained'), true);
});

test('only the three stored campaign parameters are copied', () => {
  const { campaignParams } = load();
  // Spread into a host object: values built inside the vm carry that
  // realm's Object.prototype, which deepStrictEqual treats as a mismatch.
  const result = { ...campaignParams(
    'utm_source=newsletter&utm_medium=email&utm_campaign=dashain' +
    '&tracking_no=MNL4F2A9C1B7&email=someone@example.com&utm_content=hero',
  ) };
  assert.deepEqual(result, {
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: 'dashain',
  });
  // The things that must not have come along for the ride.
  const serialised = JSON.stringify(result);
  assert.ok(!serialised.includes('MNL4F2A9C1B7'), 'a tracking number leaked');
  assert.ok(!serialised.includes('example.com'), 'an email address leaked');
});

test('missing campaign parameters are undefined rather than empty strings', () => {
  const { campaignParams } = load();
  assert.deepEqual({ ...campaignParams('') }, {
    utm_source: undefined, utm_medium: undefined, utm_campaign: undefined,
  });
});

test('an overlong campaign value is truncated', () => {
  const { campaignParams } = load();
  const long = 'x'.repeat(500);
  assert.equal(campaignParams(`utm_campaign=${long}`).utm_campaign.length, 80);
});

test('the beacon does nothing when there is no window', () => {
  // Server-side rendering must not attempt a request. If this throws, the
  // guard has been removed and every page render would try to measure.
  const { sendAnalyticsEvent } = load();
  assert.doesNotThrow(() => sendAnalyticsEvent('page_view', { path: '/' }));
});
