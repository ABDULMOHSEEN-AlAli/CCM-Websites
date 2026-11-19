// Build the Sitefinity upload package from prototype pages.
//
//   node tools/build-sitefinity.mjs CCM/pages/dean-chairmen
//       → every page in that folder (each .html except index.html)
//   node tools/build-sitefinity.mjs CCM/pages/dean-chairmen/option-2-name-cards.html
//       → one page
//
// It writes:
//   <SITE>/upload/ccm-styles.css   → the design: ONE file for every page of the site.
//                                    Upload it once to the site's library and link it
//                                    from each page's CSS widget ("Link to a file"),
//                                    or paste it into the widget ("Write CSS").
//   <SITE>/upload/<page>/<option>/
//     01-content.html              → paste into a Content block (HTML view) or an Embed code widget
//     00-check-in-live-site.html   → the live page with its content area replaced by ours
//                                    (a local visual check only; nothing is uploaded)
//
// Reads:
//   - the part of the prototype between SITEFINITY:START and SITEFINITY:END
//   - <meta name="ccm-live-url"> in the prototype: the live page it replaces
//   - design-system/ccm.css with every @import inlined (one stylesheet for all sites)
//   - <SITE>/cms-links.json: the links of the shared files (fonts, graphics and
//     ccm-styles.css itself) after they are uploaded to that site's Sitefinity library.
//     Files always come from the CMS. Until a link is filled in, the build uses a
//     fallback and says so:
//       KFUPM Display and graphics → embedded in the CSS
//       IBM Plex Sans Arabic       → Google Fonts

import { readFile, writeFile, mkdir, readdir, stat, rm } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.join(ROOT, 'design-system');

// The font files the live sites need (all display text is KFUPM Display 700).
const WEB_FONTS = [
  { family: 'KFUPM Display', weight: 700, file: 'fonts/KFUPM-Bold.woff2' },
  { family: 'IBM Plex Sans Arabic', weight: 400, file: 'fonts/IBMPlexSansArabic-Regular.woff2' },
  { family: 'IBM Plex Sans Arabic', weight: 500, file: 'fonts/IBMPlexSansArabic-Medium.woff2' },
  { family: 'IBM Plex Sans Arabic', weight: 600, file: 'fonts/IBMPlexSansArabic-SemiBold.woff2' },
  { family: 'IBM Plex Sans Arabic', weight: 700, file: 'fonts/IBMPlexSansArabic-Bold.woff2' },
];
const PLEX_GOOGLE =
  '@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap");';
const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const DOMAIN = { CCM: 'ccm.kfupm.edu.sa', ICS: 'ics.kfupm.edu.sa', COE: 'coe.kfupm.edu.sa', MATH: 'math.kfupm.edu.sa', ISE: 'ise.kfupm.edu.sa' };
const SITE_CSS = 'ccm-styles.css';
const MARKERS = /<!--\s*SITEFINITY:START[\s\S]*?-->([\s\S]*?)<!--\s*SITEFINITY:END\s*-->/;

const target = process.argv[2];
if (!target) {
  console.error('Usage: node tools/build-sitefinity.mjs <SITE/pages/page-folder | …/page.html>');
  process.exit(1);
}
const abs = path.resolve(ROOT, target);
const files = (await stat(abs)).isDirectory()
  ? (await readdir(abs))
      .filter((f) => f.endsWith('.html') && f !== 'index.html')
      .sort()
      .map((f) => path.join(abs, f))
      .filter((f) => MARKERS.test(readFileSync(f, 'utf8')))
  : [abs];
if (!files.length) throw new Error(`No pages with SITEFINITY:START/END markers in ${target}`);
const SITE = path.relative(ROOT, files[0]).split(path.sep)[0];

// ---- 0. Links to the shared files in this site's Sitefinity library --------
const linksFile = path.join(ROOT, SITE, 'cms-links.json');
const links = existsSync(linksFile) ? JSON.parse(readFileSync(linksFile, 'utf8')) : {};
const linkFor = (key) => {
  const url = (links[key] ?? '').trim();
  if (!url) return null;
  if (!/^https:\/\//.test(url)) throw new Error(`${SITE}/cms-links.json: "${key}" must be a full https:// link, got "${url}"`);
  if (DOMAIN[SITE] && new URL(url).hostname !== DOMAIN[SITE]) {
    console.warn(`WARNING ${SITE}/cms-links.json: "${key}" is on ${new URL(url).hostname}, not ${DOMAIN[SITE]}. ` +
      'Upload the file to this site\'s own library: browsers block fonts that come from another website.');
  }
  return url;
};
const used = new Map(); // design-system path → 'cms' | fallback description

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

  // url("../graphics/x.svg") → its CMS link, or a data URI until it's uploaded
  return css.replace(/url\(\s*["']?(?!data:|https?:|#)([^"')]+)["']?\s*\)/g, (m, ref) => {
    const p = path.join(dir, ref);
    if (!existsSync(p)) throw new Error(`Missing file referenced in ${path.relative(ROOT, file)}: ${ref}`);
    const dsPath = path.relative(DS, p).split(path.sep).join('/');
    const url = linkFor(dsPath);
    if (url) { used.set(dsPath, 'cms'); return `url("${url}")`; }
    used.set(dsPath, 'embedded in the CSS for now');
    const mime = MIME[path.extname(p).toLowerCase()] ?? 'application/octet-stream';
    return `url("data:${mime};base64,${readFileSync(p).toString('base64')}")`;
  });
}

const fontFace = (f, src) =>
  `@font-face {\n  font-family: "${f.family}";\n  src: url("${src}") format("woff2");\n` +
  `  font-weight: ${f.weight};\n  font-style: normal;\n  font-display: swap;\n}\n`;
let fontFaces = '';
const plex = WEB_FONTS.filter((f) => f.family.startsWith('IBM'));
const plexAllInCms = plex.every((f) => linkFor(f.file));
for (const f of WEB_FONTS) {
  const url = linkFor(f.file);
  if (f.family.startsWith('IBM') && !plexAllInCms) {
    used.set(f.file, 'Google Fonts for now (all four Plex links are needed)');
  } else if (url) {
    used.set(f.file, 'cms');
    fontFaces += fontFace(f, url);
  } else {
    used.set(f.file, 'embedded in the CSS for now');
    fontFaces += fontFace(f, `data:font/woff2;base64,${(await readFile(path.join(DS, f.file))).toString('base64')}`);
  }
}

const designCss = (await inline(path.join(DS, 'ccm.css'))).trim();
// The build number changes only when the CSS itself changes, so it tells you whether
// the copy in the Sitefinity library is the latest one.
const build = createHash('sha256').update(fontFaces + designCss).digest('hex').slice(0, 8);
const header =
  `/* CCM design system for ${SITE}, build ${build} (${new Date().toISOString().slice(0, 10)}), made by tools/build-sitefinity.mjs.\n` +
  `   One stylesheet for every page of all five sites. Do not edit here: change design-system/ and rebuild. */\n`;
// @import must come first in a stylesheet, so the Google Fonts line goes before the header.
// The last rule shows the build number on pages that have <p class="ccm-build">.
const css = (plexAllInCms ? '' : PLEX_GOOGLE + '\n') + header + fontFaces + designCss + '\n' +
  `.ccm-scope .ccm-build::after { content: " ${build}"; }\n`;

const siteCssFile = path.join(ROOT, SITE, 'upload', SITE_CSS);
const oldBuild = existsSync(siteCssFile) ? readFileSync(siteCssFile, 'utf8').match(/, build ([0-9a-f]{8}) /)?.[1] ?? null : null;
await mkdir(path.dirname(siteCssFile), { recursive: true });
await writeFile(siteCssFile, css);

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
  // Files from the older layout (one CSS copy per option). Replaced by upload/ccm-styles.css.
  for (const old of ['01-styles.css', '02-content.html']) await rm(path.join(outDir, old), { force: true });

  const proto = await readFile(file, 'utf8');
  const liveUrl = proto.match(/<meta\s+name="ccm-live-url"\s+content="([^"]+)"/)?.[1];
  const m = proto.match(MARKERS);
  if (!m) throw new Error(`No SITEFINITY:START/END markers in ${rel.join('/')}`);

  const inner = m[1]
    .replace(/<!--[\s\S]*?-->/g, '')   // drop comments
    .replace(/\n\s*\n+/g, '\n')        // collapse blank lines
    .replace(/^ {6}/gm, '  ')          // re-indent
    .trim();
  // All five sites look the same (CCM colouring), so the wrapper is identical everywhere.
  const html = `<div class="ccm-scope">\n  ${inner}\n</div>\n`;
  await writeFile(path.join(outDir, '01-content.html'), html);

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

  console.log(`${site}/upload/${pageName}/${option}/  content ${kb(html)}${checkNote}`);
}

// ---- 3. The site stylesheet and the shared files -----------------------------
const change = oldBuild === null ? 'new file' : oldBuild === build ? 'unchanged' : `CHANGED, was build ${oldBuild}`;
console.log(`\n${SITE}/upload/${SITE_CSS}  ${kb(css)}, build ${build} (${change})`);
const cssLink = linkFor(SITE_CSS);
if (cssLink && oldBuild !== null && oldBuild !== build) {
  console.log(`  → Upload this new ${SITE_CSS} to the ${SITE} library, replacing the old file. Pages that link it update by themselves.`);
}
console.log(cssLink
  ? `  Pages link it from the CSS widget ("Link to a file"): ${cssLink}`
  : `  Not in the ${SITE} library yet: paste it into a CSS widget ("Write CSS"), or upload it and add its link to ${SITE}/cms-links.json.`);

const missing = [...used].filter(([, how]) => how !== 'cms');
console.log(`\nShared files: ${used.size - missing.length} of ${used.size} linked from the ${SITE} Sitefinity library (${SITE}/cms-links.json).`);
if (missing.length) {
  console.log('Not uploaded yet, so the build uses a fallback:');
  for (const [file, how] of missing) console.log(`  design-system/${file}  →  ${how}`);
  console.log(`Upload them to the ${SITE} Sitefinity library, paste their links into ${SITE}/cms-links.json and build again.`);
  console.log(`How: ${SITE}/upload/sitefinity-test/HOW-TO-TEST.md, part A.`);
}
