const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Built from char codes rather than written as escapes, so what this file
// asserts does not depend on how the editor or shell treated a backslash.
const BACKSLASH = String.fromCharCode(92);
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);
const escaped = (name) => BACKSLASH + name;

function load() {
  const source = fs.readFileSync('src/lib/seo/serialize.ts', 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require, JSON, String, RegExp, Object });
  return exports.serialize;
}

test('a closing script tag in the data cannot break out of the block', () => {
  const serialize = load();
  const payload = '</script><img src=x onerror=alert(1)>';
  const out = serialize({ headline: payload });
  assert.ok(!out.includes('</script>'), 'the raw closing tag survived escaping');
  assert.ok(out.includes(escaped('u003c')), 'expected < to be escaped');
  // Escaping must not change what a parser reads back.
  assert.equal(JSON.parse(out).headline, payload);
});

test('ampersands and angle brackets are escaped', () => {
  const serialize = load();
  const out = serialize({ name: 'Rice & Dal <Nepal>' });
  assert.ok(!out.includes('&'), 'a raw ampersand survived');
  assert.ok(!out.includes('<'), 'a raw < survived');
  assert.ok(!out.includes('>'), 'a raw > survived');
  assert.equal(JSON.parse(out).name, 'Rice & Dal <Nepal>');
});

test('U+2028 and U+2029 are escaped, since they end a line in JavaScript', () => {
  const serialize = load();
  const body = 'a' + LINE_SEPARATOR + 'b' + PARAGRAPH_SEPARATOR + 'c';
  const out = serialize({ body });
  assert.ok(!out.includes(LINE_SEPARATOR), 'raw U+2028 survived');
  assert.ok(!out.includes(PARAGRAPH_SEPARATOR), 'raw U+2029 survived');
  assert.ok(out.includes(escaped('u2028')) && out.includes(escaped('u2029')));
  assert.equal(JSON.parse(out).body, body);
  // And the result must still be valid JavaScript once inlined.
  assert.doesNotThrow(() => new vm.Script('var x = ' + out + ';'));
});

test('ordinary content is left alone', () => {
  const serialize = load();
  assert.equal(serialize({ a: 1, b: 'Kathmandu' }), '{"a":1,"b":"Kathmandu"}');
});
