/**
 * JSON for embedding inside a `<script>` tag.
 *
 * The previous code did `.replace(/</g, '<')`, which is a no-op: in a
 * TypeScript source that escape *is* the character `<`, so it replaced `<`
 * with `<`. Harmless while the data was static, but it would not have
 * stopped a `</script>` inside a blog title from closing the tag early.
 *
 * Besides the tag-breaking characters, U+2028 and U+2029 are escaped: they
 * are valid in a JSON string but are line terminators in JavaScript, so an
 * unescaped one turns a single-line literal into a syntax error.
 *
 * The patterns are built with the RegExp constructor rather than written as
 * literals. A literal containing U+2028 is itself split across lines by the
 * parser, and in a `.tsx` file a `/>/g` literal reads as the start of JSX.
 */

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

const ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [LINE_SEPARATOR]: "\\u2028",
  [PARAGRAPH_SEPARATOR]: "\\u2029",
};

const UNSAFE = new RegExp("[<>&\\u2028\\u2029]", "g");

export function serialize(value: unknown): string {
  return JSON.stringify(value).replace(UNSAFE, (match) => ESCAPES[match] ?? match);
}
