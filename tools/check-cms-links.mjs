// Check the links in <SITE>/cms-links.json: does each uploaded file open, is it the
// right file, and is it the latest version?
//
//   node tools/check-cms-links.mjs CCM
//
// For every link it checks:
//   - it's on the site's own address (browsers block fonts from another website)
//   - it opens (HTTP 200) and the website says the right file type
//     (CSS must be text/css and SVG must be image/svg+xml, or the browser ignores them)
//   - the uploaded file is the same as ours (same size; for ccm-styles.css, the same build code)
// It also lists files the build needs that have no link yet, and links the build doesn't use.
// Nothing is uploaded or changed.

import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.join(ROOT, 'design-system');
const DOMAIN = { CCM: 'ccm.kfupm.edu.sa', ICS: 'ics.kfupm.edu.sa', COE: 'coe.kfupm.edu.sa', MATH: 'math.kfupm.edu.sa', ISE: 'ise.kfupm.edu.sa' };
const SITE = (process.argv[2] || '').toUpperCase();
if (!DOMAIN[SITE]) {
  console.error('Usage: node tools/check-cms-links.mjs <CCM|ICS|COE|MATH>');
  process.exit(2);
}
const tty = process.stdout.isTTY;
const paint = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const OK = paint('32;1', 'OK   '), BAD = paint('31;1', 'ERROR'), WARN = paint('33;1', 'WARN '), TODO = paint('36;1', 'TODO ');

// ---- What the build needs: the fonts it lists, and every file the CSS points to
const build = readFileSync(path.join(ROOT, 'tools/build-sitefinity.mjs'), 'utf8');
const fontEntries = [...build.matchAll(/\{[^{}]*file:\s*'(fonts\/[^']+)'[^{}]*\}/g)];
const needed = new Set(fontEntries.map((m) => m[1]));
// IBM Plex Sans Arabic is only for Arabic letters: an empty link is fine
const optional = new Set(fontEntries.filter((m) => /arabicOnly:\s*true/.test(m[0])).map((m) => m[1]));
function cssRefs(file) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]*\}/g, '');
  for (const m of css.matchAll(/@import\s+url\(\s*["']?([^"')]+)["']?\s*\)/g)) cssRefs(path.join(path.dirname(file), m[1]));
  for (const m of css.matchAll(/url\(\s*["']?(?!data:|https?:|#)([^"')]+)["']?\s*\)/g)) {
    if (/\.css$/.test(m[1])) continue;
    needed.add(path.relative(DS, path.join(path.dirname(file), m[1])).split(path.sep).join('/'));
  }
}
cssRefs(path.join(DS, 'ccm.css'));
needed.add('ccm-styles.css');

const linksFile = path.join(ROOT, SITE, 'cms-links.json');
const links = JSON.parse(readFileSync(linksFile, 'utf8'));
const localOf = (key) => (key === 'ccm-styles.css' ? path.join(ROOT, SITE, 'upload', key) : path.join(DS, key));
const TYPE = { '.css': /^text\/css/, '.svg': /^image\/svg\+xml/, '.woff2': /^(font\/woff2|application\/(font-woff2|octet-stream))/ };
const buildCode = (s) => s.match(/, build ([0-9a-f]{8}) /)?.[1];

console.log(`\nChecking ${SITE}/cms-links.json (${DOMAIN[SITE]})\n`);
let errors = 0, todo = 0;
const keys = [...new Set([...needed, ...Object.keys(links).filter((k) => !k.startsWith('_'))])];
for (const key of keys) {
  let url = (links[key] ?? '').trim();
  const label = key.padEnd(38);
  if (!needed.has(key)) {
    console.log(`${WARN} ${label} not used by the design any more: no need to upload it (you can delete this line).`);
    continue;
  }
  if (!url && optional.has(key)) { console.log(`${OK} ${label} optional: only needed for Arabic text.`); continue; }
  if (!url) { todo++; console.log(`${TODO} ${label} no link yet: upload it, then paste its link.`); continue; }
  if (url.startsWith(`http://${DOMAIN[SITE]}/`)) url = 'https://' + url.slice(7); // the build does the same
  let u;
  try { u = new URL(url); } catch { errors++; console.log(`${BAD} ${label} not a valid link: "${url}"`); continue; }
  if (u.protocol !== 'https:') { errors++; console.log(`${BAD} ${label} must start with https://`); continue; }
  if (u.hostname !== DOMAIN[SITE]) { errors++; console.log(`${BAD} ${label} is on ${u.hostname}: upload it to ${DOMAIN[SITE]}'s own library.`); continue; }

  let res, body;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    body = Buffer.from(await res.arrayBuffer());
  } catch (e) { errors++; console.log(`${BAD} ${label} could not be opened (${e.message}).`); continue; }
  if (!res.ok) { errors++; console.log(`${BAD} ${label} HTTP ${res.status}: the link is wrong or the file isn't there. Open it in a browser to check.`); continue; }

  const type = res.headers.get('content-type') || '(none)';
  const ext = path.extname(key).toLowerCase();
  const notes = [];
  let level = OK;
  if (TYPE[ext] && !TYPE[ext].test(type)) { level = BAD; notes.push(`the website sends it as "${type}", so browsers will ignore it`); }

  const local = localOf(key);
  if (existsSync(local)) {
    const mine = readFileSync(local);
    if (key === 'ccm-styles.css') {
      const theirs = buildCode(body.toString('utf8')), ours = buildCode(mine.toString('utf8'));
      if (theirs !== ours) { if (level === OK) level = WARN; notes.push(`the library has build ${theirs ?? '?'}, yours is build ${ours}: replace the file in the library`); }
      else notes.push(`build ${ours}, the latest`);
    } else if (ext === '.svg' && body.length !== mine.length &&
               body.toString('utf8').replace(/\s+/g, '') === mine.toString('utf8').replace(/\s+/g, '')) {
      notes.push('Sitefinity reformatted it on upload (spaces and line ends only), same drawing');
    } else if (body.length !== mine.length) {
      if (level === OK) level = WARN;
      notes.push(`different file: ${body.length} bytes in the library, ${mine.length} bytes in design-system/${key}`);
    }
  }
  const age = Number(res.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] ?? 0);
  if (age > 86400) notes.push(`browsers keep it ${Math.round(age / 86400)} days`);
  if (level === BAD) errors++;
  console.log(`${level} ${label} ${(body.length / 1024).toFixed(0)} KB${notes.length ? ': ' + notes.join('; ') : ''}`);
}

console.log(`\n${errors ? `${errors} link(s) to fix.` : 'No broken links.'}${todo ? ` ${todo} file(s) still to upload.` : ''}`);
if (!errors && !todo) console.log(`Next: node tools/build-sitefinity.mjs ${SITE}/pages/<page>  (it should say "linked from the ${SITE} Sitefinity library").`);
process.exit(errors ? 1 : 0);
