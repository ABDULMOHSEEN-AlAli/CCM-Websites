// Take preview screenshots of prototype pages with Microsoft Edge (headless).
//
//   node tools/screenshot.mjs CCM/pages/dean-chairmen
//       → every page in that folder (each .html except index.html)
//   node tools/screenshot.mjs CCM/pages/dean-chairmen/option-2-name-cards.html "#show=profile-sultan" popup
//       → one page, in a given state (see design-system/preview.js), saved with a suffix
//
// Writes <page folder>/previews/<option>[-suffix]-desktop.png and -phone.png.
// The phone shot loads the page inside a 390px-wide iframe, because headless
// Edge will not lay a window out narrower than about 500px.

import { spawnSync } from 'node:child_process';
import { existsSync, statSync, readdirSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
if (!EDGE) {
  console.error('Microsoft Edge was not found.');
  process.exit(1);
}

// Options: --height=N and --phone-height=N set the screenshot heights. Use them
// for designs low on a long page (home page bands): the page opens scrolled to
// the design (<meta name="ccm-preview-focus">), and a shorter shot keeps it at the top.
const argv = process.argv.slice(2);
const flag = (name) => Number(argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]) || 0;
const [target, hash = '', suffix = ''] = argv.filter((a) => !a.startsWith('--'));
if (!target) {
  console.error('Usage: node tools/screenshot.mjs <page folder | page.html> ["#show=id"] [suffix] [--height=N] [--phone-height=N]');
  process.exit(1);
}
const abs = path.resolve(ROOT, target);
const files = statSync(abs).isDirectory()
  ? readdirSync(abs).filter((f) => f.endsWith('.html') && f !== 'index.html').sort().map((f) => path.join(abs, f))
  : [abs];

const tmp = mkdtempSync(path.join(tmpdir(), 'ccm-shot-'));
const profile = path.join(tmp, 'edge-profile'); // keeps the user's own Edge profile untouched

function shoot(url, out, width, height) {
  rmSync(out, { force: true });
  spawnSync(EDGE, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--user-data-dir=${profile}`, `--window-size=${width},${height}`,
    '--virtual-time-budget=8000', `--screenshot=${out}`, url,
  ], { stdio: 'ignore', timeout: 90_000 });
  if (!existsSync(out)) throw new Error(`Screenshot failed: ${out}`);
}

// A state shot (pop-up open) is about what's on screen, so use screen-sized
// shots; a normal shot shows the whole page, including the live header and
// footer that preview.js adds around the design.
const desktopH = flag('height') || (hash ? 900 : 2400);
const phoneH = flag('phone-height') || (hash ? 844 : 4000);

// The page loads inside an iframe for both shots: headless Edge won't lay a
// window out narrower than about 500px, and it doesn't capture a page that
// scrolled itself (a page that opens scrolled to its design).
function shootFramed(url, out, width, height) {
  const harness = path.join(tmp, `frame-${width}.html`);
  writeFileSync(harness,
    `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff;overflow:hidden}` +
    `iframe{display:block;width:${width}px;height:${height}px;border:0}</style><iframe src="${url}"></iframe>`);
  shoot(pathToFileURL(harness).href, out, width, height);
}

for (const file of files) {
  const dir = path.join(path.dirname(file), 'previews');
  mkdirSync(dir, { recursive: true });
  const name = path.basename(file, '.html') + (suffix ? `-${suffix}` : '');
  const url = pathToFileURL(file).href + hash;

  shootFramed(url, path.join(dir, `${name}-desktop.png`), 1280, desktopH);
  shootFramed(url, path.join(dir, `${name}-phone.png`), 390, phoneH);

  console.log(`✓ ${path.relative(ROOT, dir)}/${name}-desktop.png, -phone.png`);
}
rmSync(tmp, { recursive: true, force: true });
