// Compare the HTML we pasted into Sitefinity with what Sitefinity saved.
//
//   node tools/compare-saved.mjs CCM/upload/sitefinity-test/test-page
//       → compares 01-content.html with content-after-save.html in that folder
//   node tools/compare-saved.mjs <pasted.html> <saved.html>
//
// How to get content-after-save.html: in Sitefinity, open the Content block again
// (Edit), switch to the HTML view, press Ctrl+A and Ctrl+C, and paste it into a new
// file called content-after-save.html in the same folder as 01-content.html.
//
// The editor of a Content block may delete or rewrite tags and attributes it doesn't
// know. This lists every change, and what it breaks, in plain words.

import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [a, b] = process.argv.slice(2);
if (!a) {
  console.error('Usage: node tools/compare-saved.mjs <upload/page/option folder>  |  <pasted.html> <saved.html>');
  process.exit(2);
}
let pastedFile, savedFile;
if (!b && statSync(path.resolve(ROOT, a)).isDirectory()) {
  pastedFile = path.resolve(ROOT, a, '01-content.html');
  savedFile = path.resolve(ROOT, a, 'content-after-save.html');
} else {
  pastedFile = path.resolve(ROOT, a);
  savedFile = path.resolve(ROOT, b);
}
for (const f of [pastedFile, savedFile]) {
  if (!existsSync(f)) {
    console.error(`Not found: ${path.relative(ROOT, f)}`);
    if (f === savedFile) console.error('Copy the HTML view of the saved Content block into that file first (see the top of this script).');
    process.exit(2);
  }
}

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)));
const TAG = /<([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
function parse(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  const tags = [...html.matchAll(TAG)].map((t) => {
    const attrs = {};
    for (const m of t[2].matchAll(/([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
      attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '').trim();
    }
    return { name: t[1].toLowerCase(), attrs };
  });
  const text = decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return { tags, text };
}
const count = (list) => list.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map());
function diff(before, after) {
  const A = count(before), B = count(after);
  const lost = [], gained = [];
  for (const [k, n] of A) if ((B.get(k) ?? 0) < n) lost.push([k, n - (B.get(k) ?? 0)]);
  for (const [k, n] of B) if ((A.get(k) ?? 0) < n) gained.push([k, n - (A.get(k) ?? 0)]);
  return { lost, gained };
}

// What breaks when an attribute or tag is lost.
const EFFECT = {
  popover: 'pop-ups stay hidden or show as plain text',
  popovertarget: 'clicking a name no longer opens its pop-up',
  popovertargetaction: 'the X button no longer closes the pop-up',
  details: 'expanding rows no longer open and close',
  summary: 'expanding rows lose their clickable row',
  button: 'buttons that open pop-ups are gone',
  class: 'the design no longer applies to those elements',
  id: 'pop-ups and in-page links can\'t find their target',
  role: 'screen readers lose the meaning of the element',
  type: 'buttons may act like form buttons',
  name: 'rows no longer close each other when one opens',
  width: 'images make the page jump while loading',
  height: 'images make the page jump while loading',
  loading: 'images load earlier than needed (slower page)',
  alt: 'screen readers lose the image description',
  lang: 'Arabic text loses its language setting',
  dir: 'Arabic text loses its right-to-left direction',
  target: 'external links open in the same tab',
  rel: 'external links lose their safety setting',
};
const effectOf = (k) => EFFECT[k] ?? (k.startsWith('aria-') ? 'screen readers lose information' : '');

const P = parse(readFileSync(pastedFile, 'utf8'));
const S = parse(readFileSync(savedFile, 'utf8'));
let problems = 0;
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
console.log(`\nPasted: ${rel(pastedFile)}\nSaved:  ${rel(savedFile)}\n`);

// 1. Tags
const tagDiff = diff(P.tags.map((t) => t.name), S.tags.map((t) => t.name));
for (const [k, n] of tagDiff.lost) {
  problems++;
  console.log(`REMOVED  ${n} × <${k}>${effectOf(k) ? `  → ${effectOf(k)}` : ''}`);
}
for (const [k, n] of tagDiff.gained) console.log(`ADDED    ${n} × <${k}>`);

// 2. Attributes (present or not), by tag
const attrKeys = (tags) => tags.flatMap((t) => Object.keys(t.attrs).map((k) => `${t.name} ${k}`));
const attrDiff = diff(attrKeys(P.tags), attrKeys(S.tags));
for (const [k, n] of attrDiff.lost) {
  problems++;
  const [tag, attr] = k.split(' ');
  console.log(`REMOVED  ${n} × ${attr}="…" on <${tag}>${effectOf(attr) ? `  → ${effectOf(attr)}` : ''}`);
}
for (const [k, n] of attrDiff.gained) {
  const [tag, attr] = k.split(' ');
  console.log(`ADDED    ${n} × ${attr}="…" on <${tag}>`);
}

// 3. Attribute values that changed (links rewritten, classes trimmed …)
const values = (tags) => tags.flatMap((t) => Object.entries(t.attrs).map(([k, v]) => `${k}=${v}`));
const valDiff = diff(values(P.tags), values(S.tags));
const changedAttrs = new Set(attrDiff.lost.map(([k]) => k.split(' ')[1]));
const lostVals = valDiff.lost.filter(([kv]) => !changedAttrs.has(kv.split('=')[0]));
if (lostVals.length) {
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  // Pair each lost value with a new value of the same attribute, in page order.
  const gainedBy = new Map();
  for (const [kv, n] of valDiff.gained) {
    const k = kv.split('=')[0];
    for (let i = 0; i < n; i++) gainedBy.set(k, [...(gainedBy.get(k) ?? []), kv.slice(k.length + 1)]);
  }
  console.log('\nCHANGED values (pasted → saved):');
  for (const [kv] of lostVals.slice(0, 25)) {
    const k = kv.split('=')[0];
    const now = gainedBy.get(k)?.shift();
    console.log(`  ${cut(kv, 110)}`);
    console.log(`    now: ${now === undefined ? '(gone)' : cut(now, 104)}`);
  }
  if (lostVals.length > 25) console.log(`  … and ${lostVals.length - 25} more`);
  problems += lostVals.length;
}

// 4. Text
if (P.text !== S.text) {
  problems++;
  let i = 0;
  while (i < P.text.length && P.text[i] === S.text[i]) i++;
  console.log('\nTEXT changed. First difference:');
  console.log(`  pasted: …${P.text.slice(Math.max(0, i - 40), i + 60)}…`);
  console.log(`  saved:  …${S.text.slice(Math.max(0, i - 40), i + 60)}…`);
}

console.log(problems
  ? `\n${problems} change${problems > 1 ? 's' : ''} found. Send this report to Claude. If anything important was REMOVED, use the Embed code widget instead of the Content block.`
  : '\nNo changes: Sitefinity kept the HTML exactly as pasted. The Content block is safe to use.');
process.exit(problems ? 1 : 0);
