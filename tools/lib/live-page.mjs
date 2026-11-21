// Shared by build-sitefinity.mjs and live-frame.mjs: read a live Sitefinity page
// and find the part a design replaces.

const cache = new Map();

// Fetch a live page once per run.
export function fetchLive(url) {
  if (!cache.has(url)) {
    cache.set(url, (async () => {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.text();
    })());
  }
  return cache.get(url);
}

// Split the page around the inside of its main content column (the page
// template's "Content" placeholder, beside the side menu):
//   before  = everything up to and including the column's opening <div>
//   content = what the column holds today (the widgets we replace)
//   after   = the column's closing </div> and everything after it
export function splitAtContent(html) {
  const open = html.search(/<div[^>]*data-placeholder-label="Content"[^>]*>/);
  if (open < 0) throw new Error('content placeholder not found (not a Sitefinity page?)');
  const start = html.indexOf('>', open) + 1;
  let depth = 1;
  let t;
  const tag = /<(\/?)div\b[^>]*>/gi;
  tag.lastIndex = start;
  while (depth > 0 && (t = tag.exec(html))) depth += t[1] ? -1 : 1;
  if (depth !== 0) throw new Error('unbalanced divs around the content column');
  return { before: html.slice(0, start), content: html.slice(start, t.index), after: html.slice(t.index) };
}

// Split the page around everything between the site header and the footer,
// for a whole-page design (a new home page). The header is the template's
// last "CustomNav" <nav> (the main menu); the footer is the first <footer>.
//   before  = the header
//   content = everything between header and footer (replaced by the design)
//   after   = the footer and the rest
export function splitAtMain(html) {
  const footer = html.search(/<footer\b/i);
  if (footer < 0) throw new Error('no <footer> on the page');
  const navs = [...html.slice(0, footer).matchAll(/<nav\b[^>]*data-sf-element="CustomNav"[^>]*>/gi)];
  if (!navs.length) throw new Error('no header (CustomNav) found');
  const start = navs[navs.length - 1].index;
  // The main menu leaves a <div> open, so find its end by counting tags like a browser.
  const masked = html.replace(/<(script|style)\b[\s\S]*?<\/(script|style)\s*>|<!--[\s\S]*?-->/gi, (m) => ' '.repeat(m.length));
  const re = new RegExp(TAG_SOURCE, 'g');
  re.lastIndex = start;
  const stack = [];
  let end = -1;
  for (let t; (t = re.exec(masked));) {
    const name = t[2].toLowerCase();
    if (VOID.has(name) || t[3]) continue;
    if (!t[1]) stack.push(name);
    else if (stack.includes(name)) {
      while (stack.pop() !== name);
      if (!stack.length) { end = re.lastIndex; break; }
    }
  }
  if (end < 0 || end > footer) throw new Error('could not find the end of the header');
  return { before: html.slice(0, end), content: html.slice(end, footer), after: html.slice(footer) };
}

// Split the page around a whole band, for pages without one content column,
// like the home page. The band is the largest element that holds every
// placeholder in `labels` (for example ["News", "Events"]) and no other named
// placeholder ("Container", "Row" and "Column N" don't count):
//   before  = everything before the band
//   content = the band itself (replaced by the design)
//   after   = everything after it
const GENERIC_LABEL = /^(Container|Row|Column \d+)$/i;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const TAG_SOURCE = /<(\/?)([a-zA-Z][\w-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*?(\/?)>/.source;

export function splitAtSection(html, labels) {
  const want = [].concat(labels).flatMap((l) => String(l).split(',')).map((l) => l.trim()).filter(Boolean);
  if (!want.length) throw new Error('no placeholder labels given');
  const target = html.search(new RegExp(`<div[^>]*data-placeholder-label="${want[0]}"`));
  if (target < 0) throw new Error(`placeholder "${want[0]}" not found`);

  // Blank out scripts, styles and comments (same length, so positions stay right).
  const masked = html.replace(/<(script|style)\b[\s\S]*?<\/(script|style)\s*>|<!--[\s\S]*?-->/gi, (m) => ' '.repeat(m.length));
  const tagsFrom = (from) => {
    const re = new RegExp(TAG_SOURCE, 'g');
    re.lastIndex = from;
    return re;
  };

  // 1. The placeholder's ancestors (outermost first), ending with the placeholder.
  //    Live pages aren't always well formed (CCM's main menu leaves a <div>
  //    open). Like a browser, a closing tag also closes anything still open
  //    inside it, and a closing tag with no matching opening tag is ignored.
  const open = [];
  let ancestors = null;
  const re = tagsFrom(masked.indexOf('>', masked.search(/<body\b/i)) + 1);
  for (let t; (t = re.exec(masked));) {
    const name = t[2].toLowerCase();
    if (VOID.has(name) || t[3]) continue;
    if (!t[1]) {
      open.push({ name, start: t.index });
      if (t.index === target) {
        ancestors = open.slice();
        break;
      }
    } else if (open.some((o) => o.name === name)) {
      while (open.pop().name !== name);
    }
  }
  if (!ancestors) throw new Error(`could not place placeholder "${want[0]}"`);

  // 2. Where an element ends: its own closing tag, or where its parent closes it.
  const endOf = (start) => {
    const stack = [];
    const r = tagsFrom(start);
    for (let t; (t = r.exec(masked));) {
      const name = t[2].toLowerCase();
      if (VOID.has(name) || t[3]) continue;
      if (!t[1]) stack.push(name);
      else if (!stack.includes(name)) return t.index;
      else {
        while (stack.pop() !== name);
        if (!stack.length) return r.lastIndex;
      }
    }
    return masked.length;
  };
  const named = (from, to) => [...html.slice(from, to).matchAll(/data-placeholder-label="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((l) => !GENERIC_LABEL.test(l));

  // 3. Walk outwards; keep the largest element with exactly the wanted placeholders.
  let band = null;
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const start = ancestors[i].start;
    const end = endOf(start);
    const inside = named(start, end);
    if (inside.some((l) => !want.includes(l))) break;
    if (want.every((l) => inside.includes(l))) band = { start, end };
  }
  if (!band) throw new Error(`no part of the page holds only ${want.join(' + ')}`);
  return { before: html.slice(0, band.start), content: html.slice(band.start, band.end), after: html.slice(band.end) };
}
