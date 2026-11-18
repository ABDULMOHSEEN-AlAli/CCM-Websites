// Build the Sitefinity upload package from prototype pages.
//
//   node tools/build-sitefinity.mjs CCM/pages/dean-chairmen
//       → every option-*.html in that folder
//   node tools/build-sitefinity.mjs CCM/pages/dean-chairmen/option-2-name-cards.html
//       → one option
//
// For each prototype it writes <SITE>/upload/<page>/<option>/:
//   01-styles.css              → paste into a Sitefinity "CSS" widget (Write CSS)
//   02-content.html            → paste into a Content block (HTML view) or an Embed code widget
//   00-check-in-live-site.html → the live page with its content area replaced by ours
//                                (a local visual check only; nothing is uploaded)
//
// Reads:
//   - the part of the prototype between SITEFINITY:START and SITEFINITY:END
//   - <meta name="ccm-live-url"> in the prototype: the live page it replaces
//   - design-system/ccm.css with every @import inlined. This is one stylesheet for all
//     sites, so 01-styles.css is the same file for every option and every page.
// KFUPM Display (700) and local graphics (the FAST Matrix SVG) are embedded as data URIs,
// so nothing has to be uploaded to Sitefinity's media library. IBM Plex Sans Arabic comes
// from Google Fonts (the same IBM typeface, OFL licence).

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.join(ROOT, 'design-system');

// KFUPM Display weights the components use (all display text is 700).
const DISPLAY_WEIGHTS = { 700: 'KFUPM-Bold.woff2' };
const PLEX_IMPORT =
  '@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap");';
const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

const target = process.argv[2];
if (!target) {
  console.error('Usage: node tools/build-sitefinity.mjs <SITE/pages/page-folder | …/option-x.html>');
  process.exit(1);
}
const abs = path.resolve(ROOT, target);
const files = (await stat(abs)).isDirectory()
  ? (await readdir(abs)).filter((f) => /^option-.*\.html$/.test(f)).sort().map((f) => path.join(abs, f))
  : [abs];
if (!files.length) throw new Error(`No option-*.html files in ${target}`);

// ---- 1. CSS (one file for everything) -------------------------------------
async function inline(file) {
  const dir = path.dirname(file);
  // Local @font-face rules point at font files; the build adds its own embedded one.
  let css = (await readFile(file, 'utf8')).replace(/@font-face\s*\{[^}]*\}\s*/g, '');

  let out = '';
  let last = 0;
  for (const m of css.matchAll(/@import\s+url\(\s*["']?([^"')]+)["']?\s*\)\s*;[^\n]*/g)) {
    out += css.slice(last, m.index) + (await inline(path.join(dir, m[1]))).trim() + '\n';
    last = m.index + m[0].length;
  }
  css = out + css.slice(last);

  // url("../graphics/x.svg") → data URI (relative to the file that contains it)
  return css.replace(/url\(\s*["']?(?!data:|https?:|#)([^"')]+)["']?\s*\)/g, (m, ref) => {
    const p = path.join(dir, ref);
    if (!existsSync(p)) throw new Error(`Missing file referenced in ${path.relative(ROOT, file)}: ${ref}`);
    const mime = MIME[path.extname(p).toLowerCase()] ?? 'application/octet-stream';
    return `url("data:${mime};base64,${readFileSync(p).toString('base64')}")`;
  });
}

let fontFaces = '';
for (const [weight, file] of Object.entries(DISPLAY_WEIGHTS)) {
  const b64 = (await readFile(path.join(DS, 'fonts', file))).toString('base64');
  fontFaces +=
    `@font-face {\n  font-family: "KFUPM Display";\n  src: url("data:font/woff2;base64,${b64}") format("woff2");\n` +
    `  font-weight: ${weight};\n  font-style: normal;\n  font-display: swap;\n}\n`;
}

const css = [
  PLEX_IMPORT,
  `/* CCM design system: generated ${new Date().toISOString().slice(0, 10)} by tools/build-sitefinity.mjs.`,
  `   One stylesheet for all five sites. Do not edit here: change design-system/ and rebuild. */`,
  fontFaces,
  (await inline(path.join(DS, 'ccm.css'))).trim(),
  '',
].join('\n');

// ---- 2. Per prototype: content + live-page check ---------------------------
const liveCache = new Map();
async function fetchLive(url) {
  if (!liveCache.has(url)) {
    liveCache.set(url, (async () => {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })());
  }
  return liveCache.get(url);
}

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep); // [SITE, 'pages', page, option.html]
  if (rel.length !== 4 || rel[1] !== 'pages') throw new Error(`Expected <SITE>/pages/<page>/<option>.html, got ${rel.join('/')}`);
  const [site, , pageName, fileName] = rel;
  const option = path.basename(fileName, '.html');
  const outDir = path.join(ROOT, site, 'upload', pageName, option);
  await mkdir(outDir, { recursive: true });

  const proto = await readFile(file, 'utf8');
  const liveUrl = proto.match(/<meta\s+name="ccm-live-url"\s+content="([^"]+)"/)?.[1];
  const m = proto.match(/<!--\s*SITEFINITY:START[\s\S]*?-->([\s\S]*?)<!--\s*SITEFINITY:END\s*-->/);
  if (!m) throw new Error(`No SITEFINITY:START/END markers in ${rel.join('/')}`);

  const inner = m[1]
    .replace(/<!--[\s\S]*?-->/g, '')   // drop comments
    .replace(/\n\s*\n+/g, '\n')        // collapse blank lines
    .replace(/^ {6}/gm, '  ')          // re-indent
    .trim();
  const html = `<div class="ccm-scope">\n  ${inner}\n</div>\n`;

  await writeFile(path.join(outDir, '01-styles.css'), css);
  await writeFile(path.join(outDir, '02-content.html'), html);

  let checkNote = '';
  if (!liveUrl) {
    checkNote = ' (no ccm-live-url meta: skipped live-page check)';
  } else {
    try {
      let live = await fetchLive(liveUrl);
      const { origin } = new URL(liveUrl);
      // Find the Sitefinity template's main content column and replace what's inside it.
      const open = live.search(/<div[^>]*data-placeholder-label="Content"[^>]*>/);
      if (open < 0) throw new Error('content placeholder not found (not a Sitefinity page?)');
      const start = live.indexOf('>', open) + 1;
      let depth = 1;
      let t;
      const tag = /<(\/?)div\b[^>]*>/gi;
      tag.lastIndex = start;
      while (depth > 0 && (t = tag.exec(live))) depth += t[1] ? -1 : 1;
      if (depth !== 0) throw new Error('unbalanced divs');

      live = live.slice(0, start) + `\n<style>\n${css}</style>\n${html}` + live.slice(t.index);
      live = live
        .replace(/<head>/i, `<head>\n<base href="${origin}/">`)
        .replace(/<script\b[\s\S]*?<\/script>/gi, '') // no analytics / scripts in a local check
        .replace(/<body([^>]*)>/i,
          `<body$1>\n<div style="position:sticky;top:0;z-index:9999;padding:6px 12px;background:#FFF4D6;color:#5A4300;border-bottom:1px solid #F0BA4F;font:500 13px/1.4 Segoe UI,system-ui,sans-serif;text-align:center">` +
          `Local check: the live page ${new URL(liveUrl).pathname} with its content area replaced by <b>${option}</b>. Not uploaded anywhere.</div>`);
      await writeFile(path.join(outDir, '00-check-in-live-site.html'), live);
    } catch (err) {
      checkNote = ` (skipped live-page check: ${err.message})`;
    }
  }

  console.log(`${site}/upload/${pageName}/${option}/  css ${kb(css)}, content ${kb(html)}${checkNote}`);
}
