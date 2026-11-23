// Page checker: the automatic half of design-system/checklist.html.
//
//   node tools/check-page.mjs CCM/pages/dean-chairmen
//       → every page in that folder (files with SITEFINITY:START/END markers)
//   node tools/check-page.mjs CCM/pages/dean-chairmen/option-2-name-cards.html
//       → one page
//   add --all to list every CSS warning instead of the first few per file
//
// 1. Page HTML: the part that gets uploaded (between the SITEFINITY markers) is
//    checked against the design-system rules: classes, headings, images, links,
//    phone and office formats, things the Sitefinity editor deletes, and so on.
// 2. Shared CSS: design-system files are checked for values that skip the
//    tokens (hard-coded colours, font sizes, spacing off the 4px scale …).
//
// ERROR = must be fixed before upload. WARN = have a look; fix it, or accept it
// knowingly. Exit code 1 when a page has errors.

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.join(ROOT, 'design-system');
const args = process.argv.slice(2);
const SHOW_ALL = args.includes('--all');
const target = args.find((a) => !a.startsWith('--'));
if (!target) {
  console.error('Usage: node tools/check-page.mjs <SITE/pages/page-folder | page.html> [--all]');
  process.exit(2);
}

const tty = process.stdout.isTTY;
const paint = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const LABEL = { error: paint('31;1', 'ERROR'), warn: paint('33;1', 'WARN '), ok: paint('32;1', 'OK   ') };

// Blank out comments but keep every character position (for line numbers).
const blank = (s) => s.replace(/[^\n]/g, ' ');
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, blank);
const short = (s, n = 60) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// ---------------------------------------------------------------------------
// Design-system CSS: every file that ccm.css imports, in order
// ---------------------------------------------------------------------------
async function loadSheets(file, list = []) {
  const css = await readFile(file, 'utf8');
  list.push({ file, css });
  for (const m of stripCssComments(css).matchAll(/@import\s+url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    if (!/^https?:/.test(m[1])) await loadSheets(path.join(path.dirname(file), m[1]), list);
  }
  return list;
}
const sheets = await loadSheets(path.join(DS, 'ccm.css'));
const definedClasses = new Set();
for (const { css } of sheets) {
  for (const m of stripCssComments(css).matchAll(/\.(ccm-[\w-]+)/g)) definedClasses.add(m[1]);
}

// ---------------------------------------------------------------------------
// Page HTML
// ---------------------------------------------------------------------------
function parseAttrs(s) {
  const a = {};
  for (const m of s.matchAll(/([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    a[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return a;
}
function textOf(html) {
  return html
    .replace(/<img\b[^>]*?\balt\s*=\s*"([^"]*)"[^>]*>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#?\w+;/g, '·')
    .replace(/\s+/g, ' ')
    .trim();
}

const TAG = /<([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ALLOWED_EMPTY = new Set(['iframe', 'textarea', 'script', 'video', 'audio', 'canvas', 'td', 'th', 'object', 'template']);
const FORBIDDEN_TAGS = {
  svg: 'The Sitefinity editor can delete <svg>. Use a CSS icon: <span class="ccm-ico ccm-c-…">.',
  script: 'No JavaScript in page content.',
  style: 'CSS goes in the design system (ccm-styles.css), not inside the content.',
  font: '<font> is outdated. Use design-system classes.',
  center: '<center> is outdated. Use design-system classes.',
  u: 'Only links are underlined. Remove <u>.',
  marquee: 'No moving text.',
};
const OLD_ATTRS = ['align', 'valign', 'bgcolor', 'cellpadding', 'cellspacing', 'face'];
// Words that stay lowercase inside a Title Case title (unless they come first)
const SMALL_WORDS = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'as', 'at', 'by', 'in', 'of', 'on', 'to', 'up', 'via', 'with', 'from', 'into', 'per', 'vs']);
const VAGUE_LINK =/^(read more|more|click here|here|learn more|details|more details|link|view|this|go)$/i;
const PHONE_OK = /^\+966 \d{2} \d{3} \d{4}$/;
// Images and files must live in a KFUPM Sitefinity library: a full https link on
// *.kfupm.edu.sa, or a link that starts with "/" (the same site).
const fromCms = (url = '') => /^https:\/\/([a-z0-9-]+\.)*kfupm\.edu\.sa\//i.test(url) || /^\/(?!\/)/.test(url);
const PHONE_LIKE = /(?:\+|00)?966[\d\s-]{8,14}\d|\b0\d{1,2}[\s-]?\d{3}[\s-]?\d{4}\b/g;

function checkPage(file, src) {
  const issues = [];
  // A page that replaces the whole main area (the home page) has no template title,
  // so its content must carry the page's one H1.
  const ownsH1 = /<meta\s+name="ccm-live-section"\s+content="main"/.test(src);
  const m = src.match(/<!--\s*SITEFINITY:START[\s\S]*?-->([\s\S]*?)<!--\s*SITEFINITY:END\s*-->/);
  let html, base;
  if (m) {
    html = m[1];
    base = src.indexOf(m[1], m.index);
  } else if (path.basename(file) === '01-content.html') {
    html = src;
    base = 0;
  } else {
    return [{ level: 'error', topic: 'Setup', msg: 'No SITEFINITY:START / SITEFINITY:END markers, so there is nothing to check.' }];
  }
  html = html.replace(/<!--[\s\S]*?-->/g, blank);
  const lineOf = (i) => src.slice(0, base + i).split('\n').length;
  const add = (level, topic, msg, i) => issues.push({ level, topic, msg, line: i == null ? null : lineOf(i) });

  // --- every tag: attributes, classes, ids, forbidden things ---
  const tags = [...html.matchAll(TAG)].map((t) => ({ name: t[1].toLowerCase(), attrs: parseAttrs(t[2]), i: t.index }));
  const ids = new Map();
  for (const t of tags) {
    const a = t.attrs;
    if (FORBIDDEN_TAGS[t.name]) add('error', 'Sitefinity', `<${t.name}>: ${FORBIDDEN_TAGS[t.name]}`, t.i);
    if ('style' in a) add('error', 'Styles', `Inline style on <${t.name}>. Use design-system classes and tokens instead.`, t.i);
    for (const k of Object.keys(a)) {
      if (/^on[a-z]+$/.test(k)) add('error', 'Sitefinity', `JavaScript event "${k}" on <${t.name}>. Content must work without scripts.`, t.i);
      if (OLD_ATTRS.includes(k)) add('error', 'Styles', `Old attribute "${k}" on <${t.name}>. Use design-system classes.`, t.i);
    }
    for (const c of (a.class ?? '').split(/\s+/).filter(Boolean)) {
      if (!c.startsWith('ccm-')) add('error', 'Classes', `Class "${c}" doesn't start with ccm-. Use design-system classes only.`, t.i);
      else if (!definedClasses.has(c)) add('error', 'Classes', `Class "${c}" isn't in the design system (a typo, or a new component that needs adding to design-system/components).`, t.i);
    }
    if (a.id) {
      if (ids.has(a.id)) add('error', 'IDs', `id="${a.id}" is used twice.`, t.i);
      else ids.set(a.id, t.i);
    }
    if (t.name === 'h1' && !ownsH1) add('error', 'Headings', 'The page title (H1) comes from the Sitefinity page template, so content starts at <h2>.', t.i);
    if (t.name === 'img') {
      if (!('alt' in a)) add('error', 'Images', 'Image without alt. Use the person\'s name, or alt="" when the name is already next to the photo.', t.i);
      else if (/\.(jpe?g|png|gif|webp|svg)$/i.test(a.alt) || /^(image|photo|picture|img|pic|\.+)$/i.test(a.alt.trim())) add('error', 'Images', `Alt text "${a.alt}" doesn't describe the image.`, t.i);
      if (!a.width || !a.height) add('warn', 'Images', 'Image without width and height, so the page jumps while it loads.', t.i);
      if (!fromCms(a.src)) add('error', 'CMS', `Image isn't from the Sitefinity library (${short(a.src || '(no src)')}). Upload it to the site's Images library and use its link.`, t.i);
    }
    if (t.name === 'button' && !a.type) add('warn', 'Buttons', '<button> without type="button".', t.i);
    if ((a.class ?? '').split(/\s+/).includes('ccm-check')) add('warn', 'Content', 'A name is still marked in red (ccm-check) for checking. Confirm or remove it before the page goes live.', t.i);
    if (t.name === 'iframe') add('warn', 'Sitefinity', '<iframe>: put it in an Embed code widget and check it still works after saving.', t.i);
  }

  // --- references to ids ---
  for (const t of tags) {
    for (const k of ['popovertarget', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'for']) {
      for (const ref of (t.attrs[k] ?? '').split(/\s+/).filter(Boolean)) {
        if (!ids.has(ref)) add('error', 'IDs', `${k}="${ref}" points to an id that doesn't exist on the page.`, t.i);
      }
    }
  }

  // --- empty tags (the Sitefinity editor deletes them) ---
  for (const e of html.matchAll(/<([a-zA-Z][\w-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>\s*<\/\1\s*>/g)) {
    if (!ALLOWED_EMPTY.has(e[1].toLowerCase())) add('error', 'Sitefinity', `Empty <${e[1]}>. The Sitefinity editor deletes empty tags: give it content, or draw it with CSS (::before).`, e.index);
  }
  for (const e of html.matchAll(/<br\s*\/?>\s*<br\s*\/?>/gi)) add('warn', 'Spacing', 'Two <br> in a row. Use spacing from the design system, not empty lines.', e.index);

  // --- headings: in order, no skipped levels (the template's H1 comes first) ---
  if (ownsH1) {
    const h1s = (html.match(/<h1\b/gi) || []).length;
    if (h1s !== 1) add('error', 'Headings', `This page replaces the whole main area, so the template adds no title: it needs exactly one <h1> (found ${h1s}). Make the hero title the H1.`);
  }
  let prev = 1;
  for (const h of html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi)) {
    const lvl = +h[1];
    const text = textOf(h[2]);
    if (!text) add('error', 'Headings', `Empty <h${lvl}>.`, h.index);
    if (lvl > prev + 1) add('error', 'Headings', `Heading jumps from H${prev} to H${lvl} ("${short(text, 40)}"). Don't skip levels.`, h.index);
    // Page and section titles (H1, H2) are in Title Case: "Research and Accreditation".
    if (lvl <= 2 && text) {
      const words = text.split(/\s+/);
      const lower = words.filter((w, i) => /^[a-z]/.test(w) && (i === 0 || !SMALL_WORDS.has(w.replace(/[^a-z]/g, ''))));
      if (lower.length) add('warn', 'Headings', `Title Case for page and section titles: "${short(text, 50)}" (capitalise ${lower.map((w) => `"${w}"`).join(', ')}).`, h.index);
    }
    prev = lvl;
  }

  // --- links ---
  for (const l of html.matchAll(/<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a\s*>/gi)) {
    const a = parseAttrs(l[1]);
    const text = textOf(l[2]);
    const name = (a['aria-label'] ?? '').trim() || text;
    const href = a.href;
    if (href === undefined) add('error', 'Links', `Link without href ("${short(name, 40)}").`, l.index);
    else if (/^\s*(#|javascript:.*)?\s*$/i.test(href)) add('error', 'Links', `Link with an empty address (href="${href}").`, l.index);
    else if (href.startsWith('#') && !ids.has(href.slice(1))) add('error', 'Links', `Link to #${href.slice(1)}, which doesn't exist on the page.`, l.index);
    if (!name) add('error', 'Links', 'Link with no text. Add text, or a hidden label in <span class="ccm-sr-only">.', l.index);
    else if (VAGUE_LINK.test(name)) add('warn', 'Links', `Link text "${name}" doesn't say where it goes.`, l.index);
    if (a.target === '_blank' && !/noopener/.test(a.rel ?? '')) add('error', 'Links', 'target="_blank" without rel="noopener".', l.index);
    if (/^http:\/\//i.test(href ?? '')) add('warn', 'Links', `Link uses http:// (${short(href)}). Use https:// when the site supports it.`, l.index);
    if (/^tel:/i.test(href ?? '') && !/^tel:\+966\d{9}$/.test(href)) add('warn', 'Contact', `Phone link "${href}" should look like tel:+966138600000.`, l.index);
    if (/^mailto:/i.test(href ?? '') && !/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(href)) add('error', 'Contact', `Email link "${href}" isn't a valid address.`, l.index);
    if (/\.(pdf|docx?|xlsx?|pptx?|zip)(\?|#|$)/i.test(href ?? '') && !fromCms(href)) add('error', 'CMS', `File link isn't from the Sitefinity library (${short(href)}). Upload the file to Documents & Files and link to it there.`, l.index);
  }

  // --- buttons need a name ---
  for (const b of html.matchAll(/<button\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/button\s*>/gi)) {
    const a = parseAttrs(b[1]);
    if (!(a['aria-label'] ?? '').trim() && !textOf(b[2])) add('error', 'Buttons', 'Button with no text. Add a hidden label in <span class="ccm-sr-only">.', b.index);
  }

  // --- tables ---
  for (const t of html.matchAll(/<table\b[\s\S]*?<\/table\s*>/gi)) {
    if (!/<th\b/i.test(t[0])) add('warn', 'Tables', 'Table without header cells (<th>).', t.index);
  }

  // --- visible text (tags blanked out, positions kept) ---
  const text = html.replace(/<[^>]*>/g, blank);
  for (const p of text.matchAll(/lorem ipsum|\bTODO\b|\bTBD\b|\bXXX+\b|\bplaceholder\b/gi)) {
    add('error', 'Content', `Placeholder text "${p[0]}".`, p.index);
  }
  for (const p of text.matchAll(PHONE_LIKE)) {
    if (!PHONE_OK.test(p[0].trim())) add('warn', 'Contact', `Phone "${p[0].trim()}" should be written +966 13 860 0000.`, p.index);
  }
  for (const p of text.matchAll(/\b(?:Bldg|Bld)\.?\s*#?\s*\d+|\bRm\.?\s*#?\s*\d+|\bRoom\s*#\s*\d+/gi)) {
    add('warn', 'Contact', `Office "${p[0]}" should be written "Building 22, Room 305".`, p.index);
  }
  for (const p of text.matchAll(/\b(Dr|Prof)\s+[A-Z]/g)) {
    add('warn', 'Content', `"${p[1]}" without a full stop. Write "${p[1]}." before a name.`, p.index);
  }
  for (const p of text.matchAll(/\b[A-Z][A-Z'’.-]+(?:\s+(?:&amp;\s+)?[A-Z][A-Z'’.-]+){3,}/g)) {
    // A row of short acronyms (COE ICS ISE MATH, or codes like IRC-ISS JRC-AI) is fine.
    if (p[0].split(/[\s-]+/).every((w) => w.replace(/[^A-Z]/g, '').length <= 4)) continue;
    add('warn', 'Typography', `"${short(p[0], 40)}" is typed in UPPERCASE. Type it normally; CSS makes labels uppercase.`, p.index);
  }

  return issues.sort((x, y) => (x.line ?? 0) - (y.line ?? 0));
}

// ---------------------------------------------------------------------------
// Shared CSS: values that skip the tokens (tokens.css is where raw values live)
// ---------------------------------------------------------------------------
const SPACING_PROP = /^(margin|padding)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$|^(gap|row-gap|column-gap|inset|top|right|bottom|left)$/;
const COLOUR_PROP = /^(color|background(-color)?|border(-(top|right|bottom|left|block|inline))?(-color)?|outline(-color)?|fill|stroke|text-decoration(-color)?|box-shadow)$/;

function checkCss() {
  const report = [];
  for (const { file, css } of sheets) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    if (/(tokens|ccm)\.css$/.test(rel)) continue;
    const clean = stripCssComments(css);
    const lineOf = (i) => clean.slice(0, i).split('\n').length;
    const list = [];
    for (const block of clean.matchAll(/\{([^{}]*)\}/g)) {
      let off = block.index + 1;
      for (const decl of block[1].split(';')) {
        const at = off + (decl.length - decl.trimStart().length);
        off += decl.length + 1;
        const d = decl.match(/^\s*([a-z-]+)\s*:\s*([\s\S]+?)\s*$/i);
        if (!d) continue;
        const prop = d[1].toLowerCase();
        const val = d[2].replace(/url\([^)]*\)/g, 'url()').replace(/!important/, '').trim();
        const w = (msg) => list.push({ line: lineOf(at), msg: `${prop}: ${short(val, 50)}  →  ${msg}` });

        const raw = val.replace(/var\([^)]*\)/g, 'var()'); // token names such as --ccm-white are fine
        if (/#[0-9a-f]{3,8}\b|\b(rgba?|hsla?)\(/i.test(raw) || (COLOUR_PROP.test(prop) && /\b(white|black|red|blue|green|gr[ae]y|yellow|orange)\b/i.test(raw))) {
          w('hard-coded colour; use a colour token');
        }
        if (prop === 'font-size' && !/var\(--ccm-text-|^(inherit|smaller|larger)$|^[\d.]+(em|%)$/.test(val)) w('not from the type scale; use --ccm-text-*');
        if (prop === 'font') {
          if (/(^|\s)[\d.]+(px|rem)\b/.test(val)) w('size not from the type scale; use --ccm-text-*');
          if (!/var\(--ccm-font-|inherit/.test(val)) w('font family not from the tokens; use --ccm-font-*');
        }
        if (prop === 'font-family' && !/var\(--ccm-font-|inherit/.test(val)) w('font family not from the tokens; use --ccm-font-*');
        if (SPACING_PROP.test(prop) && !/calc\(/.test(val)) {
          for (const n of val.matchAll(/(-?[\d.]+)(px|rem)\b/g)) {
            const px = Math.abs(n[2] === 'rem' ? n[1] * 16 : +n[1]);
            if (px > 3 && px % 4 !== 0) { w(`${n[0]} isn't on the 4px spacing scale; use --ccm-space-*`); break; }
          }
        }
        if (/^border(-\w+)*-radius$/.test(prop) && /\d+(\.\d+)?px/.test(val) && !/^0(px)?$/.test(val)) w('use a radius token, --ccm-radius-*');
        if (/^(transition|animation)(-duration)?$/.test(prop) && /(^|[\s,])[\d.]+m?s\b/.test(val) && !/var\(--ccm-duration/.test(val)) w('use a motion token, --ccm-duration*');
      }
    }
    if (list.length) report.push({ rel, list });
  }
  return report;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
const abs = path.resolve(ROOT, target);
let files = [];
if ((await stat(abs)).isDirectory()) {
  for (const f of (await readdir(abs)).sort()) {
    if (!f.endsWith('.html')) continue;
    const p = path.join(abs, f);
    if (/SITEFINITY:START/.test(await readFile(p, 'utf8'))) files.push(p);
  }
} else {
  files = [abs];
}
if (!files.length) {
  console.error(`No pages with SITEFINITY:START/END markers in ${target}`);
  process.exit(2);
}

let errors = 0;
let warns = 0;
console.log(`\nChecking ${files.length} page${files.length > 1 ? 's' : ''} against the CCM design system\n`);
for (const f of files) {
  const issues = checkPage(f, await readFile(f, 'utf8'));
  console.log(paint('1', path.relative(ROOT, f).split(path.sep).join('/')));
  if (!issues.length) console.log(`  ${LABEL.ok}  no problems found`);
  for (const i of issues) {
    console.log(`  ${LABEL[i.level]}  ${i.line ? `line ${String(i.line).padEnd(4)}` : '         '}  ${i.topic}: ${i.msg}`);
    if (i.level === 'error') errors++;
    else warns++;
  }
  console.log('');
}

const css = checkCss();
const cssCount = css.reduce((n, f) => n + f.list.length, 0);
console.log(paint('1', 'Shared design-system CSS') + ' (warnings only: values that skip the tokens)');
if (!css.length) console.log(`  ${LABEL.ok}  every value comes from the tokens`);
for (const { rel, list } of css) {
  console.log(`  ${LABEL.warn}  ${rel}: ${list.length}`);
  for (const x of SHOW_ALL ? list : list.slice(0, 3)) console.log(`           line ${String(x.line).padEnd(4)}  ${x.msg}`);
  if (!SHOW_ALL && list.length > 3) console.log(`           … ${list.length - 3} more (add --all to see them)`);
}

console.log(`\nResult: ${errors ? paint('31;1', `${errors} error${errors > 1 ? 's' : ''}`) : paint('32;1', '0 errors')}, ${warns} warning${warns === 1 ? '' : 's'} on the page${files.length > 1 ? 's' : ''}; ${cssCount} CSS warning${cssCount === 1 ? '' : 's'}.`);
console.log('ERROR: fix before upload.  WARN: have a look, then fix it or accept it.');
console.log('Next: answer the rest of design-system/checklist.html (the things a person has to look at).\n');
process.exit(errors ? 1 : 0);
